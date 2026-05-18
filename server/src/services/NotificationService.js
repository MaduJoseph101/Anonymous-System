const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Maps incident category to the appropriate admin email
// All fall back to ADMIN_EMAIL if specific addresses not set
const getCategoryEmail = (category) => {
  const map = {
    BULLYING_HARASSMENT: process.env.WELFARE_EMAIL,
    VERBAL_ABUSE: process.env.WELFARE_EMAIL,
    CYBERBULLYING: process.env.WELFARE_EMAIL,
    SEXUAL_HARASSMENT: process.env.WELFARE_EMAIL,
    MENTAL_HEALTH_CONCERN: process.env.COUNSELLING_EMAIL,
    HAZING: process.env.WELFARE_EMAIL,
    GROOMING_CONCERN: process.env.WELFARE_EMAIL,
    DRUG_ABUSE: process.env.SECURITY_EMAIL,
    ALCOHOL: process.env.SECURITY_EMAIL,
    THEFT: process.env.SECURITY_EMAIL,
    VANDALISM: process.env.SECURITY_EMAIL,
    CULT_ACTIVITY: process.env.SECURITY_EMAIL,
    WEAPONS: process.env.SECURITY_EMAIL,
    UNAUTHORISED_PERSONS: process.env.SECURITY_EMAIL,
    SAFETY_HAZARD: process.env.FACILITIES_EMAIL,
    FACILITIES: process.env.FACILITIES_EMAIL,
    STAFF_MISCONDUCT: process.env.ADMIN_EMAIL,
    ACADEMIC_INTEGRITY: process.env.ACADEMICS_EMAIL,
    EXAM_FRAUD: process.env.ACADEMICS_EMAIL,
  };

  return map[category] || process.env.ADMIN_EMAIL;
};

class NotificationService {

  static async notifyNewReport(report, category) {
    // NEVER throw — notification failure must not affect report processing
    try {
      const recipientEmail = getCategoryEmail(category);
      if (!recipientEmail) {
        console.warn('[Notification] No recipient email configured for:', category);
        return;
      }

      const tierLabel = {
        HIGH: 'Standard Priority',
        MEDIUM: 'Review Recommended',
        LOW: 'ELEVATED SCRUTINY REQUIRED',
        null: 'Assessment Pending'
      }[report.composite_tier] || 'Assessment Pending';

      await transporter.sendMail({
        from: `"ASIRS Reporting System" <noreply@institution.edu>`,
        to: recipientEmail,
        subject: `[${category.replace(/_/g, ' ')}] New Anonymous Report — ${tierLabel}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; 
            margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d; border-bottom: 2px solid #1a365d; 
              padding-bottom: 10px;">
              New Anonymous Incident Report
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f7fafc;">
                <td style="padding: 10px; font-weight: bold; width: 40%;">
                  Category:
                </td>
                <td style="padding: 10px;">
                  ${category.replace(/_/g, ' ')}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">
                  Tracking Code:
                </td>
                <td style="padding: 10px; font-family: monospace; 
                  font-weight: bold; color: #2b6cb0;">
                  ${report.tracking_code}
                </td>
              </tr>
              <tr style="background: #f7fafc;">
                <td style="padding: 10px; font-weight: bold;">
                  AI Credibility Tier:
                </td>
                <td style="padding: 10px;">
                  ${report.composite_tier || 'Pending Assessment'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Priority:</td>
                <td style="padding: 10px; font-weight: bold; color: ${
                  report.composite_tier === 'LOW' ? '#c53030' : '#2d6a4f'
                };">
                  ${tierLabel}
                </td>
              </tr>
              <tr style="background: #f7fafc;">
                <td style="padding: 10px; font-weight: bold;">Submitted:</td>
                <td style="padding: 10px;">
                  ${new Date(report.created_at).toLocaleString()}
                </td>
              </tr>
            </table>
            <p style="background: #ebf8ff; border-left: 4px solid #3182ce; 
              padding: 12px; margin: 20px 0;">
              Log into the admin dashboard to review this report in full.
            </p>
            <p style="color: #718096; font-size: 12px; 
              border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px;">
              <strong>Privacy Notice:</strong> This notification contains no 
              information that could identify the reporter. The report contents 
              are accessible only through the secure admin dashboard.
            </p>
          </div>
        `
      });

    } catch (error) {
      // Log but NEVER throw — notification failure is non-fatal
      console.error('[Notification] Email send error:', error.message);
    }
  }

  static async notifyEscrowReleased(report, category) {
    try {
      const recipientEmail = getCategoryEmail(category);
      if (!recipientEmail) return;

      await transporter.sendMail({
        from: `"ASIRS Reporting System" <noreply@institution.edu>`,
        to: recipientEmail,
        subject: `[${category.replace(/_/g, ' ')}] Report Now Available for Review`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">Report Released from Holding Period</h2>
            <p>A report in the <strong>${category.replace(/_/g, ' ')}</strong> category 
            (Tracking Code: <code>${report.tracking_code}</code>) has completed its 
            24-hour holding period and is now available for review in the admin dashboard.</p>
            <p style="color: #718096; font-size: 12px;">
              No identifying information about the reporter is included in this notification.
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error('[Notification] Escrow release notification error:', error.message);
    }
  }
}

module.exports = NotificationService;
