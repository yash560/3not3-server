/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const router = require('express').Router();
const httpStatus = require('http-status');
const { authorizedUser } = require('../middlewares/auth');
const User = require('../models/user.schema');
const {
  getUserByUsername,
  deleteUserAccount,
  updateUserProfileAndBannerImage,
  updateUserDetails,
} = require('../controllers/user.controllers');

router.param('userId', (req, res, next, id) => {
  User.findById(id).exec((err, doc) => {
    if (err) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    req.profile = doc;
    next();
  });
});

/**
 * Get User By Username
 * @api {get} /api/users/profile/:username
 */
router.get('/profile/:username', getUserByUsername);

// Search for user by username
router.get('/search', (req, res) => {
  const { username } = req.query;
  User.find({
    username: {
      $regex: username,
      $options: 'si',
    },
  }).exec((err, users) => {
    if (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something went wrong',
      });
    }
    return res.status(httpStatus.OK).json({ success: true, users });
  });
});

/**
 * Update User Profile And Banner Image
 * @api {post} /update/:userId/image
 * @middleware {function} authorizedUser
 */
router.post(
  '/update/:userId/image',
  authorizedUser,
  updateUserProfileAndBannerImage
);

/**
 * Delete User Account
 * @api {post} api/user/delete/:userId
 * @middleware {function} authorizedUser
 */
router.post('/delete/:userId', authorizedUser, deleteUserAccount);

/**
 * Update User Details
 * @api {post} /api/users/update/:userId
 * @middleware {function} authorizedUser
 */
router.post('/update/:userId', authorizedUser, updateUserDetails);

module.exports = router;
