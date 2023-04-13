const logger = require('@logger');
const config = require('@config');
const sgMail = require('@sendgrid/mail');
const { inviteToTeam } = require('./templates');

sgMail.setApiKey(config.sendgrid_api_key);

const sendMail = (options) => {
  const mailOptions = {
    from: 'info@3not3.com',
    to: options.to,
    subject: options.subject,
    text: 'test kiya bhai',
    html: options.html,
  };
  sgMail
    .send(mailOptions)
    .then(() => logger.info('Mail sent successfully'))
    .catch((err) => logger.error(err));
};

// sendMail({
//   to: 'nakul.londhe@gmail.com',
//   subject: 'Join a Team',
//   templateId: inviteToTeam.templateId,
//   personalizations: inviteToTeam.personalizations,
// });

module.exports = sendMail;
