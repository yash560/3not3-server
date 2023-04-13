const httpStatus = require('http-status');
const formidable = require('formidable');
const logger = require('@logger');
const User = require('../models/user.schema');
const cloudinary = require('../services/imageService');
const { getPublicId } = require('../Utils/helper');

/**
 * Get User By Username
 * @param {Object} req
 * @param {Object} res
 */
const getUserByUsername = (req, res) => {
  try {
    const { username } = req.params;
    User.findOne({ username })
      .select(
        '-encryptedPassword -resetToken -emailToken -resetTokenExpiry -googleId -facebookId '
      )
      .populate('teams')
      .then((user) => {
        if (!user) {
          return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found',
          });
        }
        return res.status(httpStatus.OK).json({
          success: true,
          message: 'User found',
          user,
        });
      });
  } catch (err) {
    logger.error(err);
    res.status(httpStatus[400]).json({
      success: false,
      message: 'Unexpected Error',
    });
  }
};

/**
 * Delete User
 * @param {Object} req
 * @param {Object} res
 */
const deleteUserAccount = (req, res) => {
  const { profile } = req;
  profile.active = false;
  profile.save((err) => {
    if (err) {
      logger.error(err);
      res
        .status(httpStatus[400])
        .json({ success: false, message: 'Unexpected Error' }); // Rewrite message needed
    }
    res
      .status(httpStatus.OK)
      .json({ success: true, message: 'User Delete Successfully' });
  });
};

/**
 * Update User Profile And Banner Image
 * @param {Object} req
 * @param {Object} res
 */
const updateUserProfileAndBannerImage = (req, res) => {
  const form = new formidable.IncomingForm({
    keepExtensions: true,
  });
  try {
    form.parse(req, async (error, fields, file) => {
      const { name } = fields;
      const { profile } = req;
      let publicId = profile[name];
      if (publicId !== 'pancake') {
        publicId = getPublicId(publicId);
      }

      const img = await cloudinary.uploader.upload(file.image.filepath);
      profile[name] = img.secure_url;

      profile.save((err, docs) => {
        if (err) {
          logger.error('==>', err);
          return res
            .status(httpStatus[400])
            .json({ success: true, message: 'Unexpected Error' });
        }
        res.status(httpStatus.OK).json({
          success: true,
          message: 'Image Uploaded Successfully',
          docs,
        });
      });

      // Delete Old Image
      if (publicId !== 'pancake') {
        cloudinary.uploader.destroy(publicId, (err) => {
          if (err) logger.error(err);
          logger.info({ publicId }, ': Image Deleted');
        });
      }
    });
  } catch (err) {
    logger.error(err);
    res.status(httpStatus[400]).json({
      success: false,
      message: 'Unexpected Error',
    });
  }
};

/**
 * Update User Details
 */
const updateUserDetails = (req, res) => {
  User.findByIdAndUpdate(req.params.userId, req.body, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      res.status(httpStatus.OK).json({
        success: true,
        message: 'User updated successfully',
        user,
      });
    })
    .catch((err) => {
      logger.error(err);
      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'User update failed',
      });
    });
};

module.exports = {
  getUserByUsername,
  deleteUserAccount,
  updateUserProfileAndBannerImage,
  updateUserDetails,
};
