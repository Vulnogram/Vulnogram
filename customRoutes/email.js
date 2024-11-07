const nodemailer = require("nodemailer");

// set from: (default security@) to: subject: text 

module.exports = {
    sendemail: async function (mailinfo)  {
	let transporter = nodemailer.createTransport({
	    sendmail: true,
	    newline: 'unix',
	    path: '/usr/sbin/sendmail',
	});
	if (!mailinfo.from) {
	    mailinfo.from = "cveprocess site <security@khulnasoft.com>";
	}
	if (!mailinfo.to) {
	    mailinfo.to = "KSF Security <security@khulnasoft.com>";
	}	
	let info = await transporter.sendMail(mailinfo);
	return info.messageId;
    }
}
