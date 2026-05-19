const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');
const { validateInput } = require('../middleware/validateInput');
const { reportSubmissionLimiter } = require('../middleware/rateLimiter');
const { generateTrackingCode, generateRetractionCode } = require('../utils/generateRTC');
const { hashString } = require('../utils/hashString');
const { encrypt, decrypt } = require('../utils/encryption');
const CompositeCredibilityService = require('../services/CompositeCredibilityService');
const EscrowService = require('../services/EscrowService');
const NotificationService = require('../services/NotificationService');

const uploadDir = path.join(process.cwd(), 'uploads', 'evidence');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^(image|video)\//.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image or video files are allowed'));
  }
});

const VALID_CATEGORIES = [
  'BULLYING_HARASSMENT', 'VERBAL_ABUSE', 'CYBERBULLYING',
  'DRUG_ABUSE', 'ALCOHOL', 'SEXUAL_HARASSMENT', 'THEFT',
  'VANDALISM', 'SAFETY_HAZARD', 'STAFF_MISCONDUCT',
  'MENTAL_HEALTH_CONCERN', 'ACADEMIC_INTEGRITY', 'HAZING',
  'CULT_ACTIVITY', 'WEAPONS', 'GROOMING_CONCERN',
  'UNAUTHORISED_PERSONS', 'FACILITIES', 'EXAM_FRAUD', 'OTHER'
];

// POST /api/reports/submit
router.post('/submit',
  reportSubmissionLimiter,
  upload.single('media'),
  [
    body('category')
      .isIn(VALID_CATEGORIES)
      .withMessage('Please select a valid incident category'),
    body('description')
      .trim()
      .isLength({ min: 30, max: 5000 })
      .withMessage('Description must be between 30 and 5000 characters'),
    body('location')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Please provide the campus location where this occurred')
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const {
        category,
        description,
        location,
        locationDescription,
        uncertaintyStatement,
        reporterContext,
        timeOfDay,
        verificationToken
      } = req.body;

      const trackingCode = generateTrackingCode();
      const requiresEscrow = EscrowService.requiresEscrow(category);

      // Student verification via email has been removed from the platform
      const isStudentVerified = false;
      const verificationWarning = null;

      // Create report — ALL sensitive fields encrypted before storage
      const report = await prisma.report.create({
        data: {
          tracking_code: trackingCode,
          retraction_code_hash: null,
          category,
          description: encrypt(description),
          location: encrypt(location),
          location_description: locationDescription ? encrypt(locationDescription) : null,
          uncertainty_statement: uncertaintyStatement ? encrypt(uncertaintyStatement) : null,
          reporter_context: reporterContext ? encrypt(reporterContext) : null,
          time_of_day: timeOfDay || null,
          status: requiresEscrow ? 'ESCROW' : 'RECEIVED',
          is_in_escrow: requiresEscrow,
          escrow_release_at: requiresEscrow
            ? new Date(Date.now() + (process.env.NODE_ENV === 'development' ? 30 * 1000 : 24 * 60 * 60 * 1000)) : null,
          is_student_verified: isStudentVerified,
          verification_method: isStudentVerified ? 'EMAIL_OTP' : null,
          ai_analysis_status: 'PENDING'
        }
      });

      if (req.file) {
        await prisma.evidence.create({
          data: {
            report_id: report.id,
            file_path: `/uploads/evidence/${req.file.filename}`,
            file_type: req.file.mimetype,
            file_size: req.file.size
          }
        });
      }

      // RESPOND TO STUDENT IMMEDIATELY
      // Student does not wait for AI processing
      res.status(201).json({
        success: true,
        trackingCode,
        isInEscrow: requiresEscrow,
        isStudentVerified,
        verificationWarning: verificationWarning || undefined,
        message: requiresEscrow
          ? 'Your report has been received. Because of its serious nature, ' +
            'it will be reviewed by a senior administrator after 24 hours. ' +
            'Use your tracking code to cancel it within this window if needed.'
          : 'Your report has been submitted successfully. ' +
            'Save your tracking code to check progress and receive updates.'
      });

      // ASYNC PROCESSING — runs after response sent to student
      setImmediate(async () => {
        try {
          // Plain text for AI analysis (never encrypted for Gemini)
          const reportForAnalysis = {
            id: report.id,
            category,
            description,
            location,
            location_description: locationDescription,
            uncertainty_statement: uncertaintyStatement,
            reporter_context: reporterContext,
            time_of_day: timeOfDay,
            created_at: report.created_at
          };

          const composite = await CompositeCredibilityService
            .generateComposite(reportForAnalysis);

          await prisma.report.update({
            where: { id: report.id },
            data: {
              ai_credibility_score: composite.geminiAssessmentDetail
                ?.overallCredibilityScore ?? null,
              ai_credibility_tier: composite.geminiAssessmentDetail
                ?.credibilityTier ?? 'UNAVAILABLE',
              ai_assessment_json: JSON.stringify(composite.geminiAssessmentDetail),
              composite_score: composite.compositeScore,
              composite_tier: composite.finalTier,
              structural_score: composite.structuralDetail?.score ?? null,
              structural_tier: composite.structuralDetail?.credibilityTier ?? null,
              statistical_flags_json: JSON.stringify(composite.statisticalDetail),
              similarity_flags_json: JSON.stringify(composite.similarityDetail),
              ai_analysis_status: 'COMPLETE',
              ai_assessed_at: new Date()
            }
          });

          // Notify only if NOT in escrow
          if (!requiresEscrow) {
            await NotificationService.notifyNewReport(
              { 
                ...report, 
                composite_tier: composite.finalTier 
              },
              category
            );
          }

        } catch (asyncError) {
          console.error('[Async] Assessment pipeline error:', asyncError.message);
          // Mark as failed but never propagate — report already saved
          await prisma.report.update({
            where: { id: report.id },
            data: { ai_analysis_status: 'FAILED' }
          }).catch(() => {});
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// GET /api/reports/track/:trackingCode
// Returns ONLY what the reporter needs to see
// NEVER returns AI scores, admin data, or full description
router.get('/track/:trackingCode', async (req, res, next) => {
  try {
    const { trackingCode } = req.params;

    if (!trackingCode || trackingCode.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid tracking code required.'
      });
    }

    const report = await prisma.report.findUnique({
      where: { tracking_code: trackingCode.toUpperCase().trim() },
      include: {
        evidence: {
          orderBy: { created_at: 'asc' }
        },
        messages: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No report found with this tracking code. ' +
          'Please check the code carefully and try again.'
      });
    }

    return res.status(200).json({
      success: true,
      report: {
        trackingCode: report.tracking_code,
        category: report.category,
        description: decrypt(report.description),
        location: decrypt(report.location),
        locationDescription: decrypt(report.location_description),
        uncertaintyStatement: decrypt(report.uncertainty_statement),
        reporterContext: decrypt(report.reporter_context),
        timeOfDay: report.time_of_day,
        status: report.status,
        isInEscrow: report.is_in_escrow,
        escrowReleaseAt: report.escrow_release_at,
        isStudentVerified: report.is_student_verified,
        verificationMethod: report.verification_method,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        resolvedAt: report.resolved_at,
        evidence: Array.isArray(report.evidence) ? report.evidence.map(item => ({
          id: item.id,
          url: item.file_path,
          path: item.file_path,
          fileType: item.file_type,
          fileSize: item.file_size,
          createdAt: item.created_at
        })) : [],
        // Return the full conversation thread for the reporter.
        messages: report.messages.map(m => ({
          id: m.id,
          senderType: m.sender_type,
          content: decrypt(m.content),
          createdAt: m.created_at
        }))
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/reports/reply — anonymous reporter sends follow-up
router.post('/reply',
  [
    body('trackingCode').notEmpty().withMessage('Tracking code required'),
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message content required')
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { trackingCode, message } = req.body;

      const report = await prisma.report.findUnique({
        where: { tracking_code: trackingCode.toUpperCase().trim() }
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found. Please check your tracking code.'
        });
      }

      if (report.status === 'CLOSED' || 
          report.status === 'RETRACTED_BY_REPORTER') {
        return res.status(400).json({
          success: false,
          message: 'This report is no longer accepting messages.'
        });
      }

      await prisma.message.create({
        data: {
          report_id: report.id,
          sender_type: 'REPORTER',
          content: encrypt(message)
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Your reply has been sent anonymously.'
      });

    } catch (error) {
      next(error);
    }
  }
);

// POST /api/reports/retract — cancel report within escrow window
router.post('/retract',
  [
    body('trackingCode')
      .notEmpty()
      .withMessage('Tracking code required')
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { trackingCode } = req.body;
      const result = await EscrowService.retractReport(trackingCode);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
