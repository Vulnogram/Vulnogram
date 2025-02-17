const nodemailer = require("nodemailer");

// set from: (default security@) to: subject: text 

module.exports = {
    sendemail: async function (mailinfo) {
        // Validate required fields
        if (!mailinfo.subject || !mailinfo.text) {
            throw new Error('Email subject and text are required');
        }
        // Sanitize input
        const sanitizedMailInfo = {
            ...mailinfo,
            subject: mailinfo.subject.trim(),
            text: mailinfo.text.trim()
        };
        let transporter = nodemailer.createTransport({
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail',
        });
        // Use configuration for default addresses
        const config = require('../config/conf');
        if (!sanitizedMailInfo.from) {
            sanitizedMailInfo.from = config.defaultFromEmail || "cveprocess site <security@khulnasoft.com>";
        }
        if (!sanitizedMailInfo.to) {
            sanitizedMailInfo.to = config.defaultToEmail || "KSF Security <security@khulnasoft.com>";
        }
        try {
            const info = await transporter.sendMail(sanitizedMailInfo);
            return info.messageId;
        } catch (error) {
            console.error('Failed to send email:', error);
            throw new Error('Failed to send email: ' + error.message);
        }
    }
}
