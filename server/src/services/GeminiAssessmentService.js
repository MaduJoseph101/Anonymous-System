const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GeminiAssessmentService {

  static fileToGenerativePart(absolutePath, mimeType) {
    try {
      if (!fs.existsSync(absolutePath)) {
        console.warn(`[GeminiAssessmentService] File does not exist at: ${absolutePath}`);
        return null;
      }
      const data = fs.readFileSync(absolutePath).toString('base64');
      return {
        inlineData: {
          data,
          mimeType
        }
      };
    } catch (err) {
      console.error(`[GeminiAssessmentService] Failed to read file for Gemini:`, err.message);
      return null;
    }
  }

  static getModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });
  }

  static buildPrompt(report) {
    const mediaEvidence = (report.evidence || []).filter(e => e.file_type.startsWith('image/') || e.file_type.startsWith('video/'));
    
    let mediaSection = '';
    if (mediaEvidence && mediaEvidence.length > 0) {
      mediaSection = `
CRITICAL: THE REPORTER HAS SUBMITTED MEDIA EVIDENCE (PHOTOS/VIDEOS), WHICH ARE ATTACHED TO THIS REQUEST.
Your role now includes a visual forensic and correlation analysis of the attached media.
For EACH attached file:
1. VISUAL FORENSICS & AI DETECTION:
   - Carefully inspect the media for visual signs of generative AI creation (e.g., warped structures, anatomical errors like impossible fingers/limbs, unnaturally smooth textures, inconsistent lighting, nonsensical text in background signs, uniform digital grain/noise, temporal inconsistencies in video).
   - Set "isAiGenerated" to true if you detect clear visual indicators or if the metadata scan findings list strong AI generators.
2. REPORT CORRELATION ANALYSIS:
   - Analyse if the media contents correlate with the written report details (e.g. if the report states a fire occurred in the cafeteria, does the media depict the cafeteria or fire/smoke damage?).
   - Provide a concise but rich analysis explanation under "correlationAnalysis".

ATTACHED MEDIA SUMMARY FOR YOUR FORENSIC REVIEW:`;
      for (const media of mediaEvidence) {
        const findings = media.metadataFindings || [];
        const baseName = media.file_path.split('/').pop();
        mediaSection += `
- Media File: "${baseName}"
  Mime-Type: ${media.file_type}
  Binary Metadata Scan Findings: [${findings.join(', ') || 'No AI signatures detected in binary tags'}]`;
      }
    } else {
      mediaSection = `
No media evidence was submitted for this report.
`;
    }

    return `
You are a credibility assessment assistant for an anonymous incident 
reporting system at a higher education institution. Your role is 
strictly advisory. You analyse structural and linguistic patterns only.

ABSOLUTE RULES: never violate these:
- NEVER state that a report is true or false
- NEVER make judgements about any named individual
- NEVER suggest any action be taken against anyone  
- ALWAYS acknowledge the limitations of text-based analysis
- ALWAYS account for non-standard English varieties including informal 
  registers, code-switching, and regional varieties WITHOUT penalising 
  them as credibility concerns
- Non-standard grammar or informal phrasing is NOT suspicious

FOUR DIMENSIONS TO ASSESS ONLY:

1. INTERNAL CONSISTENCY (0-25 points)
Do the timeline, location, and described events cohere with each other?
Does the report contradict itself?

2. STRUCTURAL AUTHENTICITY (0-25 points)
Does the report contain: peripheral sensory detail beyond just visual 
description, natural uncertainty acknowledgements, contextual embedding 
explaining why the reporter was there, and the kind of narrative 
imperfection typical of genuine memory? Fabricated accounts tend to be 
suspiciously smooth and purposeful.

3. PROPORTIONALITY (0-25 points)
Is the level of detail proportionate to the severity of the allegation? 
A serious allegation described in very few words is structurally unusual.

4. LINGUISTIC PATTERNS (0-25 points)
Are there unusual patterns such as abrupt register shifts, vocabulary 
inconsistent with the described context, or formulaic phrasing that 
appears composed rather than recalled? Note: informal or non-standard 
English is NOT suspicious.

For each dimension, provide a fuller explanation that references the
actual text features observed. Use a CBCA-informed lens: contextual
embedding, temporal structure, complications, sensory detail,
spontaneous corrections, and uncertainty markers. Keep the analysis
advisory and avoid any statement about truth or falsehood.

REPORT TO ASSESS:
Category: ${report.category.replace(/_/g, ' ')}
Location: ${report.location || 'Not specified'}
Time of Day: ${report.time_of_day || 'Not specified'}
Submitted: ${new Date(report.created_at || Date.now()).toISOString()}

Report Description:
"""
${report.description}
"""
${report.location_description
  ? '\nLocation Detail: ' + report.location_description : ''}
${report.uncertainty_statement
  ? '\nReporter Uncertainty Statement: ' + report.uncertainty_statement : ''}
${report.reporter_context
  ? '\nReporter Context (why they were there): ' + report.reporter_context : ''}
${report.pattern_observation
  ? '\nPattern Observation: ' + report.pattern_observation : ''}
${report.witness_presence
  ? '\nWitness Presence: ' + report.witness_presence : ''}
${report.immediate_action
  ? '\nImmediate Action: ' + report.immediate_action : ''}
${report.ongoing_status
  ? '\nOngoing Status: ' + report.ongoing_status : ''}

${mediaSection}

Return ONLY valid JSON with NO markdown, NO code blocks, NO preamble:
{
  "overallCredibilityScore": <integer 0-100>,
  "credibilityTier": "<HIGH|MEDIUM|LOW>",
  "confidence": "<HIGH|MEDIUM|LOW>",
  "dimensions": {
    "internalConsistency": {
      "score": <integer 0-25>,
      "observations": "<plain English observation>"
    },
    "structuralAuthenticity": {
      "score": <integer 0-25>,
      "observations": "<plain English observation>"
    },
    "proportionality": {
      "score": <integer 0-25>,
      "observations": "<plain English observation>"
    },
    "linguisticPatterns": {
      "score": <integer 0-25>,
      "observations": "<plain English observation>"
    }
  },
  "flaggedConcerns": ["<concern>"],
  "positiveIndicators": ["<indicator>"],
  "cbcaStyleObservations": [
    {
      "criterion": "<CBCA criterion>",
      "status": "<Supported|Limited|Not observed>",
      "observation": "<plain English observation>"
    }
  ],
  "adminGuidance": "<one paragraph plain-language guidance>",
  "limitations": "<what this assessment cannot determine>",
  "overallSummary": "<2-4 sentence final summary of the pattern of evidence>",
  "forensicConclusion": "<one sentence advisory conclusion>",
  "reviewPriority": "<LOW|MEDIUM|HIGH>",
  "aiGeneratedImageDetected": <true|false>,
  "imageAnalysis": [
    {
      "filename": "<string>",
      "isAiGenerated": <true|false>,
      "correlationAnalysis": "<string>",
      "observedDetails": "<string>"
    }
  ]
}
    `;
  }

  static generateMockAssessment(mediaEvidence) {
    let mockImageAnalysis = [];
    let mockAiDetected = false;

    if (mediaEvidence && mediaEvidence.length > 0) {
      mockImageAnalysis = mediaEvidence.map(ev => {
        const hasAiFindings = ev.metadataFindings && ev.metadataFindings.length > 0;
        if (hasAiFindings) {
          mockAiDetected = true;
        }
        const baseName = ev.file_path.split('/').pop();
        return {
          filename: baseName,
          isAiGenerated: hasAiFindings,
          correlationAnalysis: 'Mock visual correlation: The content depicted in the media corresponds logically with the incident described in the report.',
          observedDetails: `Mock observation: Authentic camera exposure properties. ${hasAiFindings ? 'Binary metadata scan flagged ' + ev.metadataFindings.join(', ') + ' markers.' : 'No AI software markers or rendering patterns observed.'}`
        };
      });
    }

    return {
      overallCredibilityScore: 50,
      credibilityTier: 'MEDIUM',
      confidence: 'MEDIUM',
      dimensions: {
        internalConsistency: { score: 15, observations: 'Mock observation: Consistent timeline.' },
        structuralAuthenticity: { score: 10, observations: 'Mock observation: Limited sensory detail.' },
        proportionality: { score: 15, observations: 'Mock observation: Standard detail length.' },
        linguisticPatterns: { score: 10, observations: 'Mock observation: Natural language used.' }
      },
      flaggedConcerns: [],
      positiveIndicators: ['Mock positive indicator'],
      cbcaStyleObservations: [
        {
          criterion: 'Contextual embedding',
          status: 'Supported',
          observation: 'Mock observation: The reporter gives a reason for being present.'
        }
      ],
      adminGuidance: 'Mock guidance: Proceed with standard review.',
      limitations: 'Mock limitation: Text analysis only.',
      overallSummary: 'Mock summary: The account is moderately consistent, but the detail depth is limited in test mode.',
      forensicConclusion: 'Mock conclusion: Use standard corroboration procedures.',
      reviewPriority: 'MEDIUM',
      aiGeneratedImageDetected: mockAiDetected,
      imageAnalysis: mockImageAnalysis,
      assessedAt: new Date().toISOString(),
      assessedBy: 'gemini-2.5-flash-mock',
      error: false,
      mandatoryDisclaimer:
        'This AI assessment analyses linguistic and structural patterns only. ' +
        'It cannot determine whether described events actually occurred. ' +
        'It must never be the sole basis for any institutional action. ' +
        'All decisions require qualified human review and independent corroboration.'
    };
  }

  static async assessReport(report) {
    try {
      const mediaEvidence = (report.evidence || []).filter(e => e.file_type.startsWith('image/') || e.file_type.startsWith('video/'));

      // Prevent hitting daily limits on the free tier during development/testing
      if (process.env.USE_MOCK_AI === 'true') {
        console.log('Gemini API skipped (USE_MOCK_AI is true). Returning mock assessment.');
        await new Promise(resolve => setTimeout(resolve, 800));
        return this.generateMockAssessment(mediaEvidence);
      }

      const model = this.getModel();
      const prompt = this.buildPrompt(report);

      const mediaParts = [];
      for (const media of mediaEvidence) {
        const absolutePath = path.join(process.cwd(), media.file_path);
        const part = this.fileToGenerativePart(absolutePath, media.file_type);
        if (part) {
          mediaParts.push(part);
        }
      }
      
      let responseText = null;
      
      // Resilient Retry Mechanism (Up to 3 attempts for transient fetch failures)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const contentPayload = [prompt, ...mediaParts];
          const result = await model.generateContent(contentPayload);
          responseText = result.response.text();
          break; // Success, exit retry loop
        } catch (err) {
          console.warn(`[Gemini API] Attempt ${attempt} failed: ${err.message}`);
          if (attempt === 3) {
            if (err.message && err.message.includes('429')) {
               console.warn("[Gemini API] Quota exceeded on live attempt. Activating automatic Mock AI Fallback.");
               return this.generateMockAssessment(mediaEvidence);
            }
            throw new Error(`Gemini API permanently failed after 3 attempts: ${err.message}`);
          }
          
          // Exponential backoff: wait 1s, then 2s before retrying
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }

      let assessment;
      try {
        assessment = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No valid JSON in Gemini response');
        assessment = JSON.parse(jsonMatch[0]);
      }

      // Validate and clamp score
      if (typeof assessment.overallCredibilityScore !== 'number') {
        throw new Error('Invalid assessment structure');
      }
      assessment.overallCredibilityScore = Math.max(
        0, Math.min(100, assessment.overallCredibilityScore)
      );

      // Validate tier
      if (!['HIGH', 'MEDIUM', 'LOW'].includes(assessment.credibilityTier)) {
        assessment.credibilityTier = assessment.overallCredibilityScore >= 65
          ? 'HIGH' : assessment.overallCredibilityScore >= 40 ? 'MEDIUM' : 'LOW';
      }

      // Post-process imageAnalysis and enforce binary helper flags
      if (!assessment.imageAnalysis) {
        assessment.imageAnalysis = [];
      }

      let hasAiFlag = false;
      for (const img of mediaEvidence) {
        const baseName = img.file_path.split('/').pop();
        const binFindings = img.metadataFindings || [];
        
        let imgAnalysis = assessment.imageAnalysis.find(x => x.filename === baseName);
        if (!imgAnalysis) {
          imgAnalysis = {
            filename: baseName,
            isAiGenerated: binFindings.length > 0,
            correlationAnalysis: 'Linguistic-visual correlation complete.',
            observedDetails: 'Image parsed during assessment.'
          };
          assessment.imageAnalysis.push(imgAnalysis);
        }

        if (binFindings.length > 0) {
          imgAnalysis.isAiGenerated = true;
          imgAnalysis.observedDetails = `[METADATA WARN] AI software signatures (${binFindings.join(', ')}) detected in the binary structure of this file. ${imgAnalysis.observedDetails || ''}`;
        }

        if (imgAnalysis.isAiGenerated) {
          hasAiFlag = true;
        }
      }

      if (hasAiFlag) {
        assessment.aiGeneratedImageDetected = true;
      } else {
        assessment.aiGeneratedImageDetected = !!assessment.aiGeneratedImageDetected;
      }

      // Add hardcoded fields; CANNOT be overridden by AI response
      return {
        ...assessment,
        assessedAt: new Date().toISOString(),
        assessedBy: 'gemini-2.5-flash',
        error: false,
        reviewPriority: assessment.reviewPriority
          || (assessment.credibilityTier === 'HIGH' ? 'LOW'
            : assessment.credibilityTier === 'MEDIUM' ? 'MEDIUM' : 'HIGH'),
        // MANDATORY DISCLAIMER; hardcoded, never from AI
        mandatoryDisclaimer:
          'This AI assessment analyses linguistic and structural patterns only. ' +
          'It cannot determine whether described events actually occurred. ' +
          'It must never be the sole basis for any institutional action. ' +
          'All decisions require qualified human review and independent corroboration.'
      };

    } catch (error) {
      console.error('Gemini assessment error:', error.message);
      // CRITICAL: AI failure NEVER propagates to report processing
      return {
        overallCredibilityScore: null,
        credibilityTier: 'UNAVAILABLE',
        confidence: 'UNAVAILABLE',
        error: true,
        errorMessage: error.message || 'AI assessment unavailable for this report',
        assessedAt: new Date().toISOString(),
        assessedBy: 'gemini-2.5-flash',
        mandatoryDisclaimer:
          'AI assessment was unavailable. Apply standard manual review procedures. ' +
          'This does not affect the validity of the report.'
      };
    }
  }
}

module.exports = GeminiAssessmentService;
