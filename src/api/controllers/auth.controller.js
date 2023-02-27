const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { responseMessage } = require('../utils');
const { authService } = require('../services');
const { responseHandler } = require('../handlers');
const { tokenService } = require('../services');

const register = catchAsync(async (req, res) => {
  /** Register user */
  const user = await authService.register(req.body);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.OTP_SENT,
    { userId: user._id }
  );
});

const verifyAuthOtp = catchAsync(async (req, res) => {
  /** Verify otp */
  const user = await authService.verifyAuthOtp(req.body);
  logger.info('User created');

  // /** Generate token */
  const tokens = await tokenService.generateAuthTokens(user._id);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { tokens, user }
  );
});

const login = catchAsync(async (req, res) => {
  const { mobile } = req.body;

  const user = await authService.login(mobile);

  logger.info('User found');

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.OTP_SENT,
    { userId: user._id }
  );
});

module.exports = {
  login,
  register,
  verifyAuthOtp,
};
