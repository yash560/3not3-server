const ejs = require('ejs');
const nodemailer = require('nodemailer');
const logger = require('@logger');
const fs = require('fs');
const { htmlToText } = require('html-to-text');
const juice = require('juice');
const { auth } = require('@config').email.smtp;

// initialize nodemailer
const transporter = nodemailer.createTransport({
  service: 'Godaddy',
  host: 'smtpout.secureserver.net',
  port: 465,
  secureConnection: true,
  auth: {
    user: auth.user,
    pass: auth.pass,
  },
});

transporter.verify((err) => {
  if (err) logger.error(err);
  else logger.info('MAIL is running');
});

const sendMail = (options) => {
  const { templateName, templateVars } = options;
  const templatePath = `./templates/${templateName}.html`;

  const mailOptions = {
    from: 'info@3not3.com',
    to: options.to,
    subject: options.subject,
    template: templateName,
  };

  if (templateName && fs.existsSync(templatePath)) {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(template, templateVars);
    const text = htmlToText(html);
    const htmlWithStylesInlined = juice(html);

    mailOptions.html = htmlWithStylesInlined;
    mailOptions.text = text;
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return logger.error(error);
    }
    logger.log(`Message sent: ${info.response}`);
  });
};

/**
 * Format
 */
// sendMail({
//   templateName: 'verify',
//   to: 'nakul.londhe@gmail.com',
//   subject: 'Just checking',
//   templateVars: {
//     name: '',
//     link: 'ss',
//   },
// });

module.exports = sendMail;
