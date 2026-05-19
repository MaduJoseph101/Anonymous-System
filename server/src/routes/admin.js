const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateInput } = require('../middleware/validateInput');
const { decrypt, encrypt } = require('../utils/encryption');
const { hashString } = require('../utils/hashString');
const { assessStructuralCredibility } = require('../utils/structuralAnalysis');

// Role to category access mapping
const CATEGORY_ROLE_MAP = {
  BULLYING_HARASSMENT: ['WELFARE_OFFICER','COUNSELLOR','SUPER_ADMIN'],
  VERBAL_ABUSE: ['WELFARE_OFFICER','COUNSELLOR','SUPER_ADMIN'],
  CYBERBULLYING: ['WELFARE_OFFICER','COUNSELLOR','SUPER_ADMIN'],
  SEXUAL_HARASSMENT: ['WELFARE_OFFICER','SUPER_ADMIN'],
  MENTAL_HEALTH_CONCERN: ['COUNSELLOR','WELFARE_OFFICER','SUPER_ADMIN'],
  HAZING: ['WELFARE_OFFICER','SECURITY_OFFICER','SUPER_ADMIN'],
  GROOMING_CONCERN: ['WELFARE_OFFICER','SUPER_ADMIN'],
  DRUG_ABUSE: ['SECURITY_OFFICER','SUPER_ADMIN'],
  ALCOHOL: ['SECURITY_OFFICER','SUPER_ADMIN'],
  THEFT: ['SECURITY_OFFICER','SUPER_ADMIN'],
  VANDALISM: ['SECURITY_OFFICER','FACILITY_MANAGER','SUPER_ADMIN'],
  CULT_ACTIVITY: ['SECURITY_OFFICER','SUPER_ADMIN'],
  WEAPONS: ['SECURITY_OFFICER','SUPER_ADMIN'],
  UNAUTHORISED_PERSONS: ['SECURITY_OFFICER','SUPER_ADMIN'],
  SAFETY_HAZARD: ['FACILITY_MANAGER','SUPER_ADMIN'],
  FACILITIES: ['FACILITY_MANAGER','SUPER_ADMIN'],
  STAFF_MISCONDUCT: ['SUPER_ADMIN'],
  ACADEMIC_INTEGRITY: ['ACADEMIC_AFFAIRS','SUPER_ADMIN'],
  EXAM_FRAUD: ['ACADEMIC_AFFAIRS','SUPER_ADMIN'],
  OTHER: ['WELFARE_OFFICER','SUPER_ADMIN']
};

const getAccessibleCategories = (role) => {
  if (role === 'SUPER_ADMIN') return Object.keys(CATEGORY_ROLE_MAP);
  return Object.entries(CATEGORY_ROLE_MAP)
    .filter(([, roles]) => roles.includes(role))
    .map(([cat]) => cat);
};

const canAccessCategory = (role, category) => {
  const roles = CATEGORY_ROLE_MAP[category];
  return roles && (roles.includes(role) || role === 'SUPER_ADMIN');
};

const safeParseJson = (value) => {
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

const buildSignals = (report, aiAssessment, statisticalDetail, similarityDetail, structuralDetail) => {
  const signals = [];

  if (aiAssessment) {
    signals.push({
      source: 'Gemini AI Linguistic Analysis',
      score: report.ai_credibility_score,
      tier: report.ai_credibility_tier,
      weight: '40%',
      summary: aiAssessment.overallSummary || aiAssessment.adminGuidance || 'AI analysis completed.'
    });
  }

  if (structuralDetail) {
    signals.push({
      source: 'Structural Pattern Analysis (CBCA)',
      score: report.structural_score,
      tier: report.structural_tier,
      weight: '35%',
      summary: structuralDetail.summary || structuralDetail.adminNote || 'Structural analysis completed.'
    });
  }

  if (statisticalDetail) {
    signals.push({
      source: 'Statistical Anomaly Detection',
      score: statisticalDetail.overallFlag === 'HIGH_SCRUTINY' ? 35
        : statisticalDetail.overallFlag === 'ELEVATED_SCRUTINY' ? 55 : 75,
      tier: statisticalDetail.overallFlag === 'HIGH_SCRUTINY' ? 'LOW'
        : statisticalDetail.overallFlag === 'ELEVATED_SCRUTINY' ? 'MEDIUM' : 'HIGH',
      weight: '25%',
      summary: statisticalDetail.interpretation || 'Statistical analysis completed.'
    });
  }

  if (similarityDetail?.hasSuspiciousPattern || (similarityDetail?.matches?.length > 0)) {
    signals.push({
      source: 'Similarity Context',
      score: report.composite_score,
      tier: report.composite_tier,
      weight: 'Supplementary',
      summary: similarityDetail.interpretation
        || 'A similarity pattern was detected and should be reviewed as supplementary context.'
    });
  }

  return signals;
};

const normalizeReportDetail = (report, rtcReputation, structuralDetail) => {
  const aiAssessment = safeParseJson(report.ai_assessment_json);
  const statisticalDetail = safeParseJson(report.statistical_flags_json);
  const similarityDetail = safeParseJson(report.similarity_flags_json);
  const reporterDescription = decrypt(report.description);
  const reporterLocation = decrypt(report.location);
  const reporterLocationDescription = decrypt(report.location_description);
  const reporterUncertaintyStatement = decrypt(report.uncertainty_statement);
  const reporterContext = decrypt(report.reporter_context);
  const cbcaObservations = aiAssessment?.cbcaStyleObservations || structuralDetail?.cbcaCriteria || [];

  const reviewPriority = aiAssessment?.reviewPriority
    || (report.composite_tier === 'HIGH' ? 'LOW'
      : report.composite_tier === 'MEDIUM' ? 'MEDIUM' : 'HIGH');

  const overallSummary = aiAssessment?.overallSummary
    || [
      aiAssessment?.adminGuidance,
      structuralDetail?.summary,
      statisticalDetail?.interpretation,
      similarityDetail?.interpretation
    ].filter(Boolean).join(' ') || null;

  const forensicConclusion = aiAssessment?.forensicConclusion
    || `Composite review priority: ${reviewPriority}. ${structuralDetail?.adminNote || 'Apply independent corroboration before action.'}`;

  return {
    ...report,
    category: report.category,
    description: reporterDescription,
    location: reporterLocation,
    location_description: reporterLocationDescription,
    locationDescription: reporterLocationDescription,
    uncertainty_statement: reporterUncertaintyStatement,
    uncertaintyStatement: reporterUncertaintyStatement,
    reporter_context: reporterContext,
    reporterContext,
    time_of_day: report.time_of_day,
    timeOfDay: report.time_of_day,
    compositeScore: report.composite_score,
    compositeTier: report.composite_tier,
    structuralScore: report.structural_score,
    structuralTier: report.structural_tier,
    aiAnalysisStatus: report.ai_analysis_status,
    isStudentVerified: report.is_student_verified,
    verificationMethod: report.verification_method,
    submittedAt: report.created_at,
    updatedAt: report.updated_at,
    resolvedAt: report.resolved_at,
    escrowReleaseAt: report.escrow_release_at,
    aiAssessment,
    geminiDetail: aiAssessment,
    aiAnalysis: aiAssessment,
    statisticalDetail,
    similarityDetail,
    structuralDetail,
    cbcaStyleObservations: cbcaObservations,
    overallSummary,
    forensicConclusion,
    reviewPriority,
    signals: buildSignals(report, aiAssessment, statisticalDetail, similarityDetail, structuralDetail),
    evidence: report.evidence.map((item) => ({
      ...item,
      url: item.file_path,
      path: item.file_path,
      filename: item.file_path?.split(/[\\/]/).pop() || item.file_path,
      mimeType: item.file_type,
      size: item.file_size
    })),
    media: report.evidence.map((item) => ({
      ...item,
      url: item.file_path,
      path: item.file_path,
      filename: item.file_path?.split(/[\\/]/).pop() || item.file_path,
      mimeType: item.file_type,
      size: item.file_size
    })),
    reporterInputs: {
      category: report.category,
      description: reporterDescription,
      location: reporterLocation,
      locationDescription: reporterLocationDescription,
      uncertaintyStatement: reporterUncertaintyStatement,
      reporterContext,
      timeOfDay: report.time_of_day,
      isStudentVerified: report.is_student_verified,
      verificationMethod: report.verification_method,
      evidenceCount: report.evidence.length
    },
    messages: report.messages.map(m => ({
      ...m,
      senderType: m.sender_type,   // normalise to camelCase for frontend
      createdAt: m.created_at,
      content: decrypt(m.content)
    })),
    auditLogs: report.audit_logs.map(log => ({
      ...log,
      admin: log.admin ? {
        ...log.admin,
        name: log.admin.name || log.admin.full_name
      } : null
    })),
    rtcReputationContext: rtcReputation
      ? {
          priorReports: rtcReputation.total_reports,
          reputationScore: rtcReputation.reputation_score,
          adminNote: rtcReputation.reputation_score >= 2
            ? 'This tracking code has a positive prior history.'
            : rtcReputation.reputation_score <= -3
            ? 'Prior reports from this code were found to be false. Apply elevated scrutiny.'
            : 'No significant prior history from this tracking code.'
        }
      : { priorReports: 0, adminNote: 'First report from this tracking code.' }
  };
};

// Apply authentication to ALL admin routes
router.use(requireAuth);

// GET /api/admin/reports
router.get('/reports', async (req, res, next) => {
  try {
    const EscrowService = require('../services/EscrowService');
    await EscrowService.releaseExpiredEscrow();
    const { status, category, compositeTier, page = 1, limit = 20 } = req.query;
    const accessibleCategories = getAccessibleCategories(req.admin.role);

    if (status === 'ESCROW') {
      return res.status(200).json({
        success: true,
        reports: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0
        }
      });
    }

    // Build where clause — exclude 'ESCROW' reports entirely from dashboard lists
    const where = {
      category: { in: accessibleCategories },
      ...(compositeTier && { composite_tier: compositeTier }),
      ...(category && accessibleCategories.includes(category) && { category }),
      NOT: { status: 'ESCROW' }
    };

    if (status) {
      where.status = status;
      where.NOT = { status: 'ESCROW' };
    } else {
      where.NOT = {
        status: { in: ['RETRACTED_BY_REPORTER', 'ESCROW'] }
      };
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        select: {
          id: true,
          tracking_code: true,
          category: true,
          location: true,
          status: true,
          priority: true,
          is_student_verified: true,
          composite_score: true,
          composite_tier: true,
          ai_credibility_tier: true,
          ai_analysis_status: true,
          assigned_to: true,
          created_at: true,
          _count: { select: { messages: true } }
        }
      }),
      prisma.report.count({ where })
    ]);

    const decryptedReports = reports.map(r => ({
      ...r,
      location: decrypt(r.location)
    }));

    return res.status(200).json({
      success: true,
      reports: decryptedReports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reports/:id — full report detail
router.get('/reports/:id', async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        messages: { orderBy: { created_at: 'asc' } },
        evidence: true,
        audit_logs: {
          orderBy: { created_at: 'desc' },
          include: {
            admin: { select: { full_name: true, role: true } }
          }
        }
      }
    });

    if (!report || report.status === 'ESCROW') {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Enforce role-based access at the data level
    if (!canAccessCategory(req.admin.role, report.category)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this report category.'
      });
    }

    // Get RTC reputation context
    const rtcHash = hashString(report.tracking_code);
    const rtcReputation = await prisma.rTCRegistry.findUnique({
      where: { tracking_code_hash: rtcHash }
    });

    const decryptedReport = {
      category: report.category,
      description: decrypt(report.description),
      location: decrypt(report.location),
      location_description: decrypt(report.location_description),
      uncertainty_statement: decrypt(report.uncertainty_statement),
      reporter_context: decrypt(report.reporter_context),
      time_of_day: report.time_of_day
    };

    const structuralDetail = assessStructuralCredibility(decryptedReport);

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        report_id: report.id,
        admin_id: req.admin.id,
        action: 'VIEWED_REPORT',
        details: `Report viewed by ${req.admin.full_name} (${req.admin.role})`
      }
    });

    return res.status(200).json({
      success: true,
      report: normalizeReportDetail(report, rtcReputation, structuralDetail)
    });

  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/reports/:id/status
router.patch('/reports/:id/status',
  [body('status').notEmpty().withMessage('Status is required')],
  validateInput,
  async (req, res, next) => {
    try {
      const { status, corroborationNote } = req.body;

      // CORROBORATION DOCTRINE — server-side enforcement
      // This check exists at the API handler level and CANNOT be bypassed
      // from the frontend or through direct API calls
      if (status === 'ACTION_TAKEN') {
        if (!corroborationNote || 
            corroborationNote.trim().length < 50) {
          return res.status(400).json({
            success: false,
            message: 'Corroboration documentation is required before ' +
              'initiating formal action. Please document the independent ' +
              'evidence that supports this report (minimum 50 characters). ' +
              'This requirement protects individuals from institutional ' +
              'action based solely on an anonymous, unverified report.'
          });
        }
      }

      const report = await prisma.report.update({
        where: { id: req.params.id },
        data: {
          status,
          corroboration_note: corroborationNote
            ? encrypt(corroborationNote) : undefined,
          updated_at: new Date(),
          ...(status === 'RESOLVED' && { resolved_at: new Date() })
        }
      });

      await prisma.auditLog.create({
        data: {
          report_id: report.id,
          admin_id: req.admin.id,
          action: 'STATUS_UPDATED',
          details: `Status changed to ${status}.${
            corroborationNote
              ? ' Corroboration documented: ' + corroborationNote.substring(0, 100)
              : ''
          }`
        }
      });

      const statusLabels = {
        RECEIVED: 'Received',
        INVESTIGATING: 'Under Investigation',
        ACTION_TAKEN: 'Action Taken',
        RESOLVED: 'Resolved',
        RETRACTED_BY_REPORTER: 'Retracted'
      };

      await prisma.message.create({
        data: {
          report_id: report.id,
          sender_type: 'ADMIN',
          content: encrypt(`System Update: Your report status has been updated to "${statusLabels[status] || status}".`)
        }
      });

      return res.status(200).json({ success: true, status: report.status });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/reports/:id/message
router.post('/reports/:id/message',
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message content required')
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { content } = req.body;

      const message = await prisma.message.create({
        data: {
          report_id: req.params.id,
          sender_type: 'ADMIN',
          content: encrypt(content)
        }
      });

      await prisma.auditLog.create({
        data: {
          report_id: req.params.id,
          admin_id: req.admin.id,
          action: 'ADMIN_MESSAGE_SENT',
          details: 'Anonymous follow-up message sent to reporter via RTC channel'
        }
      });

      return res.status(201).json({
        success: true,
        message: { ...message, content }
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/admin/reports/:id/outcome
router.patch('/reports/:id/outcome',
  requireRole('SUPER_ADMIN','WELFARE_OFFICER','SECURITY_OFFICER','ACADEMIC_AFFAIRS'),
  [
    body('outcome')
      .isIn(['CORROBORATED','UNSUBSTANTIATED','FALSE','PENDING'])
      .withMessage('Valid outcome required')
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { outcome } = req.body;

      const report = await prisma.report.update({
        where: { id: req.params.id },
        data: { outcome }
      });

      // Update RTC reputation based on outcome
      const rtcHash = hashString(report.tracking_code);
      const reputationChange = {
        CORROBORATED: 2,
        UNSUBSTANTIATED: 0,
        FALSE: -3,
        PENDING: 0
      }[outcome];

      await prisma.rTCRegistry.upsert({
        where: { tracking_code_hash: rtcHash },
        create: {
          tracking_code_hash: rtcHash,
          reputation_score: reputationChange,
          total_reports: 1
        },
        update: {
          reputation_score: { increment: reputationChange },
          total_reports: { increment: 1 },
          last_updated: new Date()
        }
      });

      await prisma.auditLog.create({
        data: {
          report_id: req.params.id,
          admin_id: req.admin.id,
          action: 'OUTCOME_RECORDED',
          details: `Investigation outcome recorded: ${outcome}. ` +
            `RTC reputation updated by ${reputationChange > 0 ? '+' : ''}${reputationChange}.`
        }
      });

      return res.status(200).json({ success: true, outcome });
    } catch (error) {
      next(error);
    }
  }
);

// Admin user management routes — SUPER_ADMIN only

router.get('/users', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true, email: true, full_name: true,
        role: true, is_active: true, last_login: true, created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    return res.status(200).json({ success: true, users });
  } catch (error) { next(error); }
});

router.post('/users',
  requireRole('SUPER_ADMIN'),
  [
    body('email').isEmail().normalizeEmail(),
    body('full_name').isLength({ min: 2 }),
    body('password').isLength({ min: 8 }),
    body('role').isIn([
      'SUPER_ADMIN','WELFARE_OFFICER','SECURITY_OFFICER',
      'FACILITY_MANAGER','ACADEMIC_AFFAIRS','COUNSELLOR'
    ])
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { email, full_name, password, role } = req.body;

      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.adminUser.create({
        data: { email, full_name, password: hashedPassword, role },
        select: {
          id: true, email: true, full_name: true,
          role: true, is_active: true, created_at: true
        }
      });

      return res.status(201).json({ success: true, user });
    } catch (error) { next(error); }
  }
);

router.patch('/users/:id', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { full_name, role, is_active } = req.body;
    const user = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: {
        ...(full_name !== undefined && { full_name }),
        ...(role !== undefined && { role }),
        ...(typeof is_active === 'boolean' && { is_active })
      },
      select: {
        id: true, email: true, full_name: true,
        role: true, is_active: true, last_login: true
      }
    });
    return res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
});

// POST /api/admin/users/:id/reset-password — SUPER_ADMIN only
// Generates a secure temporary password, stores its hash, returns it ONCE.
router.post('/users/:id/reset-password', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const crypto = require('crypto');

    // Generate a secure temporary password: 3 groups of 4 chars
    const raw = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    const temporaryPassword = `Tmp-${raw.substring(0,4)}-${raw.substring(4,8)}-${raw.substring(8,12)}`;

    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const user = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: { password: hashedPassword },
      select: { id: true, email: true, full_name: true, role: true }
    });

    await prisma.auditLog.create({
      data: {
        admin_id: req.admin.id,
        action: 'PASSWORD_RESET',
        details: `Password reset for user ${user.email} by ${req.admin.full_name}`
      }
    });

    return res.status(200).json({
      success: true,
      temporaryPassword,
      message: 'Temporary password generated. Share it securely with the user — it is shown only once.'
    });
  } catch (error) { next(error); }
});

module.exports = router;
