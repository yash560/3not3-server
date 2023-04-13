/* eslint-disable no-param-reassign */
const logger = require('@logger');
const crypto = require('crypto');
const User = require('../models/user.schema');
const sendMail = require('../mailer/mailer');
 
const verifyEmail = async (req, res) => {
  try {
    User.findOne({ emailToken: req.params.token }, (err, user) => {
      if (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
      } else if (!user) {
        res.status(404).json({ message: 'User not found' });
      } else {
        user.emailToken = '';
        user.isEmailVerified = true;
        user.save((Err) => {
          if (Err) {
            logger.error(Err);
            res.status(500).json({
              success: false,
              message: 'Something went wrong! Try again!',
            });
          } else {
            res.status(200).json({ success: true, message: 'Email verified' });
          }
        });
      }
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: err.message });
  }
};

const sendVerifyEmailAgain = async (req, res) => {
  try {
    const token = crypto.randomBytes(20).toString('hex');
    const { user } = req;
    user.emailToken = token;
    await user.save();

    sendMail({
      to: user.email,
      subject: 'Email Verification',
      html: `<strong>https://gamesters.netlify.app/verify?token=${token}</strong>`,
    });
    res.status(200).json({
      success: true,
      message: 'Please verify with link sent on email!',
      // tokenMessge: `|| /api/verify/email/${token} || only for development`, // ATTENTION: only for development
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  verifyEmail,
  sendVerifyEmailAgain,
};
