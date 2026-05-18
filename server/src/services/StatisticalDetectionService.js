const prisma = require('../lib/prisma');
const { decrypt } = require('../utils/encryption');


class StatisticalDetectionService {

  static async detectAnomalies(report) {
    const anomalies = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // CHECK 1 — Target Concentration
    // Multiple reports naming the same individual in a short window
    const fullNamePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const namesInReport = (report.description || '').match(fullNamePattern) || [];

    for (const name of namesInReport) {
      try {
        const recentReports = await prisma.report.findMany({
          where: {
            id: { not: report.id },
            created_at: { gte: sevenDaysAgo },
            status: { not: 'RETRACTED_BY_REPORTER' }
          },
          select: { description: true }
        });

        let targetCount = 0;
        for (const r of recentReports) {
          const decrypted = decrypt(r.description) || '';
          if (decrypted.includes(name)) targetCount++;
        }

        if (targetCount >= 2) {
          anomalies.push({
            type: 'TARGET_CONCENTRATION',
            severity: targetCount >= 4 ? 'HIGH' : 'MEDIUM',
            detail: `"${name}" appears in ${targetCount + 1} reports in the ` +
              `past 7 days. May indicate coordinated targeting or a genuine ` +
              `pattern of behaviour — verify independently.`
          });
        }
      } catch (err) {
        console.error('Target concentration check error:', err.message);
      }
    }

    // CHECK 2 — Insufficient Detail for Severity
    const wordCount = (report.description || '')
      .split(/\s+/).filter(w => w.length > 0).length;
    const severeCategories = [
      'SEXUAL_HARASSMENT', 'STAFF_MISCONDUCT', 'CULT_ACTIVITY',
      'WEAPONS', 'GROOMING_CONCERN'
    ];
    if (severeCategories.includes(report.category) && wordCount < 40) {
      anomalies.push({
        type: 'INSUFFICIENT_DETAIL_FOR_SEVERITY',
        severity: 'MEDIUM',
        detail: `Only ${wordCount} words for a ${report.category.replace(/_/g, ' ')} ` +
          `report. Serious allegations typically contain more descriptive detail.`
      });
    }

    // CHECK 3 — Unusual Submission Timing (weak signal only)
    const hour = now.getHours();
    if (hour >= 2 && hour <= 4) {
      anomalies.push({
        type: 'UNUSUAL_SUBMISSION_TIME',
        severity: 'LOW',
        detail: 'Submitted between 2am and 4am. Weak signal only — ' +
          'genuine reporters sometimes submit at unusual hours when they feel safest.'
      });
    }

    // CHECK 4 — Category-Specific Volume
    try {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentSameCategory = await prisma.report.count({
        where: {
          category: report.category,
          created_at: { gte: oneDayAgo },
          id: { not: report.id },
          status: { not: 'RETRACTED_BY_REPORTER' }
        }
      });
      if (recentSameCategory > 5) {
        anomalies.push({
          type: 'ELEVATED_CATEGORY_VOLUME',
          severity: 'MEDIUM',
          detail: `${recentSameCategory} reports in the same category in the ` +
            `last 24 hours. Elevated volume may indicate coordinated submissions ` +
            `or a genuine campus-wide incident pattern.`
        });
      }
    } catch (err) {
      console.error('Category volume check error:', err.message);
    }

    const overallFlag = anomalies.some(a => a.severity === 'HIGH')
      ? 'HIGH_SCRUTINY'
      : anomalies.some(a => a.severity === 'MEDIUM')
      ? 'ELEVATED_SCRUTINY'
      : 'STANDARD';

    return {
      anomalyCount: anomalies.length,
      anomalies,
      overallFlag,
      interpretation: anomalies.length === 0
        ? 'No statistical anomalies detected.'
        : `${anomalies.length} statistical flag(s) detected. ` +
          `These are signals for consideration, not conclusions.`
    };
  }
}

module.exports = StatisticalDetectionService;
