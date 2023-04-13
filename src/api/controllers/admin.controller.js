const httpStatus = require('http-status');
const { catchAsync, pick, responseMessage, logger, SocketEvents } = require('../utils');
const { adminService, userService, productService } = require('../services');
const { responseHandler } = require('../handlers');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, tokens } = await adminService.login(email, password);
  logger.info('User found');

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
  logger.info(body);

  await productService.createNewBid(req.user, body);

  logger.info('New bid created');

  /** Add first bid */
  const io = req.app.get('socket');
  io.emit(SocketEvents.ADD_BID, req.user);
  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const blockUser = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['id', 'isReported', 'reason']);

  const user = await userService.blockUserAccount(body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { user });
});

const updatePickUpDate = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['productId', 'estimatedPickedUpDate']);

  await productService.updatePickUpDate(req.user.sub, body);

  /** Send pickup notification */
  const io = req.app.get('socket');
  io.emit(SocketEvents.ORDER_PICKUP_DATE, req.user);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, {});
});

const updatePickUp = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['productId']);

  await productService.orderPickedUp(req.user.sub, body);

  /** Send picked up status */
  const io = req.app.get('socket');
  io.emit(SocketEvents.ORDER_PICKED, req.user);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, {});
});

const makePayoutToUser = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['productId', 'userId']);

  await productService.makePayoutToUser(req.user.sub, body);

  /** Order paid */
  const io = req.app.get('socket');
  io.emit(SocketEvents.ORDER_PAID, req.user);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, {});
});

const addCategory = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['name', 'parentId', 'logo', 'isActive']);

  await productService.addCategory(body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, {});
});

const deleteCategory = catchAsync(async (req, res) => {
  /** Add user to DB */
  const body = pick(req.body, ['categoryId']);

  await productService.deleteCategory(body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, {});
});

module.exports = {
  login,
  getUsers,
  createProductBid,
  blockUser,
  updatePickUpDate,
  updatePickUp,
  makePayoutToUser,
  addCategory,
  deleteCategory,
};
