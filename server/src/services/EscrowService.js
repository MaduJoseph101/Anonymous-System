const prisma = require('../lib/prisma');
const { hashString } = require('../utils/hashString');

const HIGH_STAKES_CATEGORIES = [
  'SEXUAL_HARASSMENT',
  'STAFF_MISCONDUCT',
  'CULT_ACTIVITY',
  'WEAPONS',
  'GROOMING_CONCERN'
];

class EscrowService {

  static requiresEscrow(category) {
    return HIGH_STAKES_CATEGORIES.includes(category);
  }

  // Runs every hour via setInterval
  static async releaseExpiredEscrow() {
    try {
      const now = new Date();

      // First, grab the reports that are about to be released so we can notify
      const toRelease = await prisma.report.findMany({
        where: { status: 'ESCROW', escrow_release_at: { lte: now } },
        select: { id: true, tracking_code: true, category: true }
      });

      const result = await prisma.report.updateMany({
        where: {
          status: 'ESCROW',
          escrow_release_at: { lte: now }
        },
        data: { 
          status: 'RECEIVED',
          is_in_escrow: false
        }
      });

      if (result.count > 0) {
        console.log(
          `[Escrow] Released ${result.count} report(s) from escrow at ` +
          now.toISOString()
        );
        // Email notifications disabled per user request
      }
      return result.count;
    } catch (error) {
      console.error('[Escrow] Release error:', error.message);
      return 0;
    }
  }

  static async retractReport(trackingCode) {
    if (!trackingCode || typeof trackingCode !== 'string') {
      return {
        success: false,
        message: 'A valid tracking code is required.'
      };
    }

    try {
      const report = await prisma.report.findFirst({
        where: {
          tracking_code: trackingCode.toUpperCase().trim(),
          status: 'ESCROW',
          escrow_release_at: { gt: new Date() }
        }
      });

      if (!report) {
        return {
          success: false,
          message: 'Tracking code not found or the 24-hour window has closed. ' +
            'If your report has already been released for review, ' +
            'it cannot be retracted.'
        };
      }

      const fs = require('fs');
      const path = require('path');

      // 1. Delete physical evidence files from server disk
      const evidence = await prisma.evidence.findMany({
        where: { report_id: report.id }
      });
      for (const item of evidence) {
        if (item.file_path) {
          const absolutePath = path.join(process.cwd(), item.file_path);
          try {
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          } catch (fileErr) {
            console.error('[Escrow] Failed to delete evidence file:', absolutePath, fileErr.message);
          }
        }
      }

      // 2. Delete all related database records and the report inside a clean transaction
      await prisma.$transaction([
        prisma.message.deleteMany({ where: { report_id: report.id } }),
        prisma.evidence.deleteMany({ where: { report_id: report.id } }),
        prisma.auditLog.deleteMany({ where: { report_id: report.id } }),
        prisma.report.delete({ where: { id: report.id } })
      ]);

      return {
        success: true,
        message: 'Your report has been cancelled successfully. ' +
          'No administrator has seen its contents.'
      };

    } catch (error) {
      console.error('[Escrow] Retraction error:', error.message);
      return {
        success: false,
        message: 'An error occurred during retraction. Please try again.'
      };
    }
  }
  static async remindExpiringEscrow() {
    try {
      const now = new Date();
      // We look for reports expiring between 12 and 13 hours from now.
      // Running this every hour guarantees each report is caught exactly once.
      const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      const thirteenHoursFromNow = new Date(now.getTime() + 13 * 60 * 60 * 1000);

      const reports = await prisma.report.findMany({
        where: {
          status: 'ESCROW',
          escrow_release_at: {
            gt: twelveHoursFromNow,
            lte: thirteenHoursFromNow
          }
        }
      });

      if (reports.length > 0) {
        const { encrypt } = require('../utils/encryption');
        for (const report of reports) {
          await prisma.message.create({
            data: {
              report_id: report.id,
              sender_type: 'ADMIN',
              content: encrypt('System Reminder: Your report is currently in escrow. It will be automatically released to administrators in approximately 12 hours. If you wish to permanently cancel this report, you can do so now via the Retract Report page.')
            }
          });
        }
        console.log(`[Escrow] Sent 12-hour reminder for ${reports.length} report(s).`);
      }
    } catch (error) {
      console.error('[Escrow] Reminder error:', error.message);
    }
  }
}

// Schedule automatic escrow release and reminders every hour
// This runs as long as the server is running
setInterval(() => {
  EscrowService.releaseExpiredEscrow();
  EscrowService.remindExpiringEscrow();
}, 60 * 60 * 1000);

// Also run once at startup to release any that expired during downtime
EscrowService.releaseExpiredEscrow();

module.exports = EscrowService;
