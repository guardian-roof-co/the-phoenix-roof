const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles delivery of automated thank-you emails to new signups.
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Get email template based on lead source
 * @param {string} firstName 
 * @param {string} leadSource 
 * @param {number} [estimatedCost]
 */
const getTemplate = (firstName, leadSource, estimatedCost) => {
    const source = (leadSource || 'Website').toLowerCase();

    let subject = "Welcome to The Phoenix Roof Family!";
    let body = "";

    if (source.includes('insurance') || source.includes('analyzer')) {
        subject = "Your Policy Review: A Guide from The Phoenix Roof";
        body = `Hi ${firstName},

Thank you for choosing The Phoenix Roof as your project guide! We've received your policy document and our team is currently reviewing the fine print to ensure your property has the protection it deserves.

Think of us as your advocate—we're here to help you navigate your coverage gaps and deductibles so you can make informed decisions with confidence.

We'll be in touch shortly with any specific findings. If you have any current roof concerns, feel free to reply to this email with photos or questions, or call us at (616) 319-HAIL.

Best,
The Phoenix Roof Team`;
    } else if (source.includes('quote')) {
        const costStr = estimatedCost ? ` is $${estimatedCost.toLocaleString()}` : "";
        subject = "Your Phoenix Roof Instant Estimate";
        body = `Hi ${firstName},

Thank you for choosing The Phoenix Roof! Your instant estimate${costStr}.

Our operations team will contact you shortly to schedule a specific time for an on-site inspection to verify these details and provide a final firm proposal.

In the meantime, feel free to reply to this email with photos of your roof or any specific questions you have. You can also reach us at (616) 319-HAIL.

Best,
The Phoenix Roof Team`;
    } else if (source.includes('storm')) {
        subject = "Phoenix Roof Storm Damage Verification - Next Steps";
        body = `Hi ${firstName},

We noticed you checked the storm history for your property using the Phoenix Roof tracker. Given the recent weather activity in your area, scheduling a professional inspection is a critical next step to protect your home's value.

The Phoenix Roof experts are ready to verify any potential damage and assist with the documentation if a claim is needed. 

Feel free to reply to this email with any photos of damage you've spotted or questions about your storm report!

Best regards,
The Phoenix Roof Forensic Team`;
    } else {
        // Default Welcome
        subject = "Welcome to the Phoenix Roof Family!";
        body = `Hi ${firstName},

Welcome to the Nest! Thanks for signing up with Phoenix Roof. 

You now have early access to our premium roofing tools, including:
- Phoenix Roof Instant Estimates
- Real-time Storm Forensic Alerts
- AI-Powered Insurance Policy Reviews

We're excited to help you keep your home protected.

The Phoenix Roof Team`;
    }

    return { subject, body };
};

/**
 * Get premium HTML email template
 */
const getHTMLTemplate = (firstName, leadSource, estimatedCost) => {
    const { subject, body } = getTemplate(firstName, leadSource, estimatedCost);

    // Convert newlines to breaks for a simple start, but let's make it look premium
    const htmlBody = body.split('\n\n').map(p => `<p style="margin-bottom: 16px;">${p.replace(/\n/g, '<br>')}</p>`).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 40px; }
                .logo { font-size: 24px; font-weight: 900; color: #0f172a; font-style: italic; text-transform: uppercase; }
                .accent { color: #f97316; }
                .content { background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 12px; }
                .btn { display: inline-block; padding: 12px 24px; background: #f97316; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">The <span class="accent">Phoenix</span> Roof</div>
                </div>
                <div class="content">
                    ${htmlBody}
                </div>
                <div class="footer">
                    &copy; 2026 The Phoenix Roof & Exteriors | Serving Grand Rapids & Kent County
                </div>
            </div>
        </body>
        </html>
    `;
};

/**
 * Send Thank You Email
 * @param {Object} contact 
 * @param {string} contact.email
 * @param {string} contact.firstName
 * @param {string} [contact.leadSource]
 * @param {number} [contact.estimatedCost]
 */
const sendThankYouEmail = async (contact) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[Email Service] Missing SMTP credentials. Logging email content to console instead.');
        const template = getTemplate(contact.firstName, contact.leadSource, contact.estimatedCost);
        console.log(`--- SIMULATED EMAIL ---`);
        console.log(`To: ${contact.email}`);
        console.log(`Subject: ${template.subject}`);
        console.log(`Body: ${template.body}`);
        console.log(`-----------------------`);
        return true;
    }

    try {
        const { subject, body } = getTemplate(contact.firstName, contact.leadSource, contact.estimatedCost);
        const html = getHTMLTemplate(contact.firstName, contact.leadSource, contact.estimatedCost);

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"The Phoenix Roof" <info@roofbyphoenix.com>',
            to: contact.email,
            subject: subject,
            text: body,
            html: html
        });

        console.log('[Email Service] Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('[Email Service] Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendThankYouEmail
};
