const router = require('express').Router();
const formidable = require('formidable');
const logger = require('@logger');
const httpStatus = require('http-status');
const { authAdmin, authorizedUser } = require('../middlewares/auth');
const cloudinary = require('../services/imageService');
const sendMail = require('../mailer/mailer');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const tournamentRoutes = require('./tournamentRoutes');
const teamRoutes = require('./teamRoutes');
const verifyRoutes = require('./verifyRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/teams', teamRoutes);
router.use('/verify', verifyRoutes);
router.use('/payments', paymentRoutes);

router.use('/x', authorizedUser, authAdmin, adminRoutes);

router.post('/upload/single', authorizedUser, (req, res) => {
  const form = new formidable.IncomingForm({
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, file) => {
    if (err) {
      logger.error({ err });
      res.status(httpStatus.OK).json({ success: false, message: err });
    }
    const image = await cloudinary.uploader.upload(file.image.filepath);
    res.status(httpStatus.OK).json({ url: image.secure_url });
  });
});

router.post('/subscribe', (req, res) => {
  const { email } = req.body;
  sendMail({
    to: email,
    subject: 'Subscribed Successfully',
    html: '<h1>Thank you for showing Interest </br> We Will Contact you soon</h1>',
  });
  res.status(200).json({ success: true, message: 'Subscribed Successfully' });
});

module.exports = router;
