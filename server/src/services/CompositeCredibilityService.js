const GeminiAssessmentService = require('./GeminiAssessmentService');
const StatisticalDetectionService = require('./StatisticalDetectionService');
const SimilarityDetectionService = require('./SimilarityDetectionService');
const { assessStructuralCredibility } = require('../utils/structuralAnalysis');

class CompositeCredibilityService {

  static async generateComposite(report) {
    // Run all methods in parallel — allSettled ensures one failure
    // does not prevent others from contributing to the composite
    const [geminiResult, statisticalResult, structuralResult, similarityResult] =
      await Promise.allSettled([
        GeminiAssessmentService.assessReport(report),
        StatisticalDetectionService.detectAnomalies(report),
        Promise.resolve(assessStructuralCredibility(report)),
        SimilarityDetectionService.findSimilarReports(report)
      ]);

    const gemini = geminiResult.status === 'fulfilled'
      ? geminiResult.value : null;
    const statistical = statisticalResult.status === 'fulfilled'
      ? statisticalResult.value : null;
    const structural = structuralResult.status === 'fulfilled'
      ? structuralResult.value : null;
    const similarity = similarityResult.status === 'fulfilled'
      ? similarityResult.value : null;

    // Calculate weighted composite score starting at neutral 50
    let compositeScore = 50;
    const signals = [];

    // Gemini AI — 40% weight
    if (gemini && !gemini.error && gemini.overallCredibilityScore !== null) {
      const contribution = (gemini.overallCredibilityScore - 50) * 0.40;
      compositeScore += contribution;
      signals.push({
        source: 'Gemini AI Linguistic Analysis',
        score: gemini.overallCredibilityScore,
        tier: gemini.credibilityTier,
        weight: '40%',
        summary: gemini.adminGuidance || 'Assessment complete.'
      });
    }

    // Structural Analysis — 35% weight
    if (structural) {
      const contribution = (structural.score - 50) * 0.35;
      compositeScore += contribution;
      signals.push({
        source: 'Structural Pattern Analysis (CBCA)',
        score: structural.score,
        tier: structural.credibilityTier,
        weight: '35%',
        summary: structural.adminNote
      });
    }

    // Statistical Detection — 25% weight
    if (statistical) {
      const statPenalty = statistical.anomalies.reduce((total, anomaly) => {
        return total + (
          anomaly.severity === 'HIGH' ? -15
          : anomaly.severity === 'MEDIUM' ? -8
          : -3
        );
      }, 0);
      compositeScore += statPenalty * 0.25;
      signals.push({
        source: 'Statistical Anomaly Detection',
        score: Math.max(0, Math.min(100, 50 + statPenalty)),
        tier: statistical.overallFlag === 'HIGH_SCRUTINY' ? 'LOW'
          : statistical.overallFlag === 'ELEVATED_SCRUTINY' ? 'MEDIUM' : 'HIGH',
        weight: '25%',
        summary: statistical.interpretation
      });
    }

    // Similarity — supplementary context only (no weight in composite)
    if (similarity && similarity.hasSuspiciousPattern) {
      compositeScore -= 5; // Minor penalty for suspicious similarity
    }

    compositeScore = Math.max(0, Math.min(100, Math.round(compositeScore)));

    const finalTier = compositeScore >= 65 ? 'HIGH'
      : compositeScore >= 40 ? 'MEDIUM' : 'LOW';

    const recommendedAction = {
      HIGH: 'Standard investigation procedures apply.',
      MEDIUM: 'Proceed with standard corroboration procedures before any action.',
      LOW: 'Apply elevated corroboration scrutiny. Seek independent evidence ' +
           'before formal action. Consider senior administrator review.'
    }[finalTier];

    const overallSummary = [
      `Composite score: ${compositeScore}/100 (${finalTier}).`,
      gemini?.overallSummary || gemini?.adminGuidance,
      structural?.summary || structural?.adminNote,
      statistical?.interpretation,
      similarity?.hasSuspiciousPattern
        ? 'A similarity pattern was detected and should be treated as supplementary context.'
        : 'No suspicious similarity pattern was detected.'
    ].filter(Boolean).join(' ');

    return {
      compositeScore,
      finalTier,
      signals,
      geminiAssessmentDetail: gemini,
      statisticalDetail: statistical,
      structuralDetail: structural,
      similarityDetail: similarity,
      recommendedAction,
      overallSummary,
      forensicConclusion: `${finalTier} review priority. ${recommendedAction}`,
      // MANDATORY DISCLAIMER — always present in every composite output
      mandatoryDisclaimer:
        'This composite assessment is strictly advisory. It analyses patterns, ' +
        'not facts. It cannot determine whether described events occurred. ' +
        'All formal institutional actions require independent human corroboration.',
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = CompositeCredibilityService;
