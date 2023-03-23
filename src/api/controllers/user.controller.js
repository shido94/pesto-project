const httpStatus = require('http-status');
const { pick, catchAsync, responseMessage, UserRole, logger } = require('../utils');
const { userService, productService } = require('../services');
const { responseHandler } = require('../handlers');

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search']);
  const options = pick(req.query, ['limit', 'page', 'sort']);

  /** Remove admin from list */
  filter.role = { $ne: UserRole.ADMIN };

  const users = await userService.getUsers(filter, options);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { users });
});

const getUserProducts = catchAsync(async (req, res) => {
  logger.info('Inside getUserProducts');
  const filter = pick(req.query, ['category', 'bidStatus', 'minPrice', 'maxPrice']);
  const options = pick(req.query, ['limit', 'page', 'sort']);

  const products = await productService.getUserProducts(req.user.sub, filter, options);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { products });
});

const getUserProfile = catchAsync(async (req, res) => {
  /** Add user to DB */
  const { user, totalEarning } = await userService.getUserprofile(req.user.sub);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { user, totalEarning });
});

const getUserByUserId = catchAsync(async (req, res) => {
  /** Add user to DB */
  const params = pick(req.params, ['id']);

  const user = await userService.getUserprofile(params.id);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { user });
});

const updateProfile = catchAsync(async (req, res) => {
  /** Add user to DB */
  await userService.updateUserprofile(req.user.sub, req.body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const updateMobile = catchAsync(async (req, res) => {
  /** Add user to DB */

  await userService.updateUserMobile(req.user.sub, req.body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const verifyAuthOtp = catchAsync(async (req, res) => {
  /** Verify otp */
  await userService.verifyUpdateMobileOtp(req.body);
  logger.info('User created');

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const updateFundDetails = catchAsync(async (req, res) => {
  /** Add user to DB */
  await userService.updateFund(req.user.sub, req.body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const uploadImages = catchAsync(async (req, res) => {
  /** Add user to DB */

  const files = req.files.map((file) => {
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      key: file.key,
      contentType: file.contentType,
      size: file.size,
    };
  });

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { files });
});

module.exports = {
  getUsers,
  getUserProfile,
  getUserByUserId,
  getUserProducts,
  updateProfile,
  updateMobile,
  verifyAuthOtp,
  updateFundDetails,
  uploadImages,
};
