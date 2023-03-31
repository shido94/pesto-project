const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { responseMessage } = require('../utils');
const { authService } = require('../services');
const { responseHandler } = require('../handlers');
const { tokenService } = require('../services');

const register = catchAsync(async (req, res) => {
  /** Register user */
  const user = await authService.register(req.body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.OTP_SENT, { userId: user._id });
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await authService.forgotPassword(req.body.mobile);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { userId: user._id });
});

const resetPassword = catchAsync(async (req, res) => {
  /** Verify otp */
  await authService.resetPassword(req.body);
  logger.info('User created');

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const login = catchAsync(async (req, res) => {
  const { mobile, password } = req.body;

  const user = await authService.login(mobile, password);

  logger.info('User found');

  /** Generate token */
  const tokens = tokenService.generateAuthTokens(user._id);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.OTP_SENT, { user, tokens });
});

const resendResetOtp = catchAsync(async (req, res) => {
  /** Verify otp */
  const user = await authService.resendResetPasswordOtp(req.body.userId);
  logger.info('User otp generated');

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { userId: user._id });
});

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  resendResetOtp,
};
