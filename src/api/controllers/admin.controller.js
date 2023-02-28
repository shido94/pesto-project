const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { responseMessage } = require('../utils');
const { adminService } = require('../services');
const { responseHandler } = require('../handlers');
const { tokenService } = require('../services');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await adminService.login(email, password);
  logger.info('User found');

  // /** Generate token */
  const tokens = await tokenService.generateAuthTokens(user._id);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { tokens, user }
  );
});

module.exports = {
  login,
};
