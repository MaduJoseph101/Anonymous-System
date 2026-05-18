const prisma = require('../lib/prisma');
const { decrypt } = require('../utils/encryption');


// Simple word-level similarity using Jaccard coefficient
// In production this could be replaced with embedding-based comparison
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const tokenise = (text) => {
    return new Set(
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3) // ignore short words
    );
  };

  const set1 = tokenise(text1);
  const set2 = tokenise(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size; // Jaccard coefficient 0-1
};

class SimilarityDetectionService {

  static async findSimilarReports(report) {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    try {
      const recentReports = await prisma.report.findMany({
        where: {
          category: report.category,
          id: { not: report.id },
          created_at: { gte: sevenDaysAgo },
          status: { not: 'RETRACTED_BY_REPORTER' }
        },
        select: {
          tracking_code: true,
          description: true,
          created_at: true
        },
        take: 50 // Limit comparison pool for performance
      });

      const similarities = [];

      for (const r of recentReports) {
        const decryptedDesc = decrypt(r.description) || '';
        const similarity = calculateSimilarity(
          report.description, decryptedDesc
        );

        if (similarity > 0.35) { // Only track meaningful similarities
          similarities.push({
            trackingCode: r.tracking_code,
            similarity: Math.round(similarity * 100),
            submittedAt: r.created_at
          });
        }
      }

      similarities.sort((a, b) => b.similarity - a.similarity);

      const suspiciouslyHighSimilarity = similarities.filter(
        s => s.similarity > 80
      );
      const genuineConvergence = similarities.filter(
        s => s.similarity >= 45 && s.similarity <= 80
      );

      return {
        hasSuspiciousPattern: suspiciouslyHighSimilarity.length > 0,
        hasGenuineConvergence: genuineConvergence.length > 0,
        suspiciousReports: suspiciouslyHighSimilarity,
        convergentReports: genuineConvergence,
        interpretation: suspiciouslyHighSimilarity.length > 0
          ? `${suspiciouslyHighSimilarity.length} recent report(s) share very ` +
            `high similarity with this submission. May indicate coordinated ` +
            `submissions from a common source. Investigate independently.`
          : genuineConvergence.length > 0
          ? `${genuineConvergence.length} recent report(s) describe similar ` +
            `incidents in the same category. Independent convergence may ` +
            `support credibility.`
          : 'No significantly similar recent reports found.'
      };

    } catch (error) {
      console.error('Similarity detection error:', error.message);
      return {
        hasSuspiciousPattern: false,
        hasGenuineConvergence: false,
        suspiciousReports: [],
        convergentReports: [],
        interpretation: 'Similarity analysis unavailable.'
      };
    }
  }
}

module.exports = SimilarityDetectionService;
