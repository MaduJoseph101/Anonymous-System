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
    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    if (!startDate || isNaN(startDate.getTime())) {
      const days = parseInt(req.query.days) || 30;
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }
    if (!endDate || isNaN(endDate.getTime())) {
      endDate = new Date();
    }
    endDate.setHours(23, 59, 59, 999);

    const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return res.status(400).json({ success: false, error: "Date range cannot exceed 1 year (365 days)." });
    }

    const where = {
      created_at: { gte: startDate, lte: endDate },
      status: { notIn: ['RETRACTED_BY_REPORTER', 'ESCROW'] }
    };

    const [total, byCategory, byStatus, byTier, dailyTrend, avgTimeRows] =
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
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          AND status NOT IN ('RETRACTED_BY_REPORTER', 'ESCROW')
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,

        prisma.$queryRaw`
          SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric as avg_hours
          FROM "Report"
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          AND resolved_at IS NOT NULL
        `
      ]);

    const averageResolutionTime = avgTimeRows[0]?.avg_hours 
      ? Number(avgTimeRows[0].avg_hours).toFixed(1) 
      : null;

    return res.status(200).json({
      success: true,
      analytics: {
        totalReports: total,
        averageResolutionTime,
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
        periodDays: diffDays
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/hotspots
router.get('/hotspots', async (req, res, next) => {
  try {
    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    if (!startDate || isNaN(startDate.getTime())) {
      const days = parseInt(req.query.days) || 30;
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }
    if (!endDate || isNaN(endDate.getTime())) {
      endDate = new Date();
    }
    endDate.setHours(23, 59, 59, 999);

    const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return res.status(400).json({ success: false, error: "Date range cannot exceed 1 year (365 days)." });
    }

    const reports = await prisma.report.findMany({
      where: {
        created_at: { gte: startDate, lte: endDate },
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
    
    // First decrypt all reports
    const decryptedReports = reports.map(report => ({
      location: decrypt(report.location) || '',
      location_description: decrypt(report.location_description) || '',
      reporter_context: decrypt(report.reporter_context) || '',
      description: decrypt(report.description) || '',
      category: report.category
    }));

    // Batch extract locations to save API quota
    const extractedLocations = await HotspotExtractionService.extractLabelsBatch(decryptedReports);

    // Merge them together
    const resolvedReports = decryptedReports.map((report, idx) => ({
      ...report,
      extractedLocation: extractedLocations[idx] || 'Unknown location'
    }));

    // Prune the extraction cache to ensure deleted/retracted reports are not stored in memory
    HotspotExtractionService.pruneCache(resolvedReports);

    // Extract unique labels for clustering
    const uniqueLocations = [...new Set(resolvedReports.map(r => r.extractedLocation))]
      .filter(l => l && l !== 'Unknown location');
    
    // Get canonical mapping from AI
    const locationMapping = await HotspotExtractionService.clusterLabels(uniqueLocations);

    resolvedReports.forEach((report) => {
      let locationLabel = report.extractedLocation || 'Unknown location';
      
      if (locationLabel !== 'Unknown location' && locationMapping[locationLabel]) {
        locationLabel = locationMapping[locationLabel];
      }

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
