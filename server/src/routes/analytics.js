const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');
const { decrypt } = require('../utils/encryption');
const HotspotExtractionService = require('../services/HotspotExtractionService');


router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

// GET /api/analytics/overview
router.get('/overview', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where = {
      created_at: { gte: cutoff },
      status: { notIn: ['RETRACTED_BY_REPORTER', 'ESCROW'] }
    };

    const [total, byCategory, byStatus, byTier, dailyTrend] =
      await Promise.all([
        prisma.report.count({ where }),

        prisma.report.groupBy({
          by: ['category'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
        }),

        prisma.report.groupBy({
          by: ['status'],
          where,
          _count: { id: true }
        }),

        prisma.report.groupBy({
          by: ['composite_tier'],
          where: { ...where, composite_tier: { not: null } },
          _count: { id: true }
        }),

        prisma.$queryRaw`
          SELECT 
            DATE(created_at)::text as date,
            COUNT(*)::int as count
          FROM "Report"
          WHERE created_at >= ${cutoff}
          AND status NOT IN ('RETRACTED_BY_REPORTER', 'ESCROW')
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `
      ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalReports: total,
        byCategory: byCategory.map(b => ({
          category: b.category,
          count: b._count.id
        })),
        byStatus: byStatus.map(b => ({
          status: b.status,
          count: b._count.id
        })),
        byCredibilityTier: byTier.map(b => ({
          tier: b.composite_tier,
          count: b._count.id
        })),
        dailyTrend,
        periodDays: days
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/hotspots
router.get('/hotspots', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const reports = await prisma.report.findMany({
      where: {
        created_at: { gte: cutoff },
        status: { notIn: ['RETRACTED_BY_REPORTER', 'ESCROW'] }
      },
      select: {
        location: true,
        location_description: true,
        reporter_context: true,
        description: true,
        category: true
      }
    });

    const hotspotMap = new Map();
    const resolvedReports = await Promise.all(reports.map(async (report) => {
      const decryptedReport = {
        location: decrypt(report.location) || '',
        location_description: decrypt(report.location_description) || '',
        reporter_context: decrypt(report.reporter_context) || '',
        description: decrypt(report.description) || '',
        category: report.category
      };

      const extractedLocation = await HotspotExtractionService.extractLabel(decryptedReport);

      return {
        ...decryptedReport,
        extractedLocation: extractedLocation || 'Unknown location'
      };
    }));

    // Prune the extraction cache to ensure deleted/retracted reports are not stored in memory
    HotspotExtractionService.pruneCache(resolvedReports);

    resolvedReports.forEach((report) => {
      const locationLabel = report.extractedLocation || 'Unknown location';
      const normalizedKey = locationLabel.toLowerCase();

      if (!hotspotMap.has(normalizedKey)) {
        hotspotMap.set(normalizedKey, {
          location: locationLabel,
          count: 0,
          dominantCategoryCounts: {}
        });
      }

      const entry = hotspotMap.get(normalizedKey);
      entry.count += 1;
      entry.dominantCategoryCounts[report.category] = (entry.dominantCategoryCounts[report.category] || 0) + 1;
    });

    const hotspots = Array.from(hotspotMap.values())
      .map((entry) => {
        const dominantCategory = Object.entries(entry.dominantCategoryCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'OTHER';

        return {
          location: entry.location,
          count: entry.count,
          dominantCategory
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      hotspots
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
