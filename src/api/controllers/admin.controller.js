const httpStatus = require('http-status');
const { catchAsync, pick, responseMessage, logger } = require('../utils');
const { adminService, userService, productService } = require('../services');
const { responseHandler } = require('../handlers');
const { tokenService } = require('../services');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await adminService.login(email, password);
  logger.info('User found');

  // /** Generate token */
  const tokens = await tokenService.generateAuthTokens(user._id, user.role);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { tokens, user });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search']);
  const options = pick(req.query, ['limit', 'page', 'sort']);

  const users = await userService.queryUsers(filter, options);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { users });
});

const createProductBid = catchAsync(async (req, res) => {
  const body = pick(req.body, ['productId', 'offeredAmount']);

  await productService.createNewBid(req.user, body);

  logger.info('New bid created');

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const blockUser = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['id', 'isReported', 'reason']);

  const user = await userService.blockUserAccount(body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { user });
});

module.exports = {
  login,
  getUsers,
  createProductBid,
  blockUser,
};
