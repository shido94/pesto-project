const httpStatus = require('http-status');
const { pick, catchAsync, responseMessage, SocketEvents } = require('../utils');
const { productService } = require('../services');
const { responseHandler } = require('../handlers');

const getProductDetails = catchAsync(async (req, res) => {
  const product = await productService.getProductDetailsById(req.params.id);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { product });
});

const addSellProductRequest = catchAsync(async (req, res) => {
  /** Add product request */

  await productService.addSellRequest(req.body, req.user);

  /** Emit Notification */
  const io = req.app.get('socket');
  io.emit(SocketEvents.SELL_PRODUCT, req.user);
  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const editProduct = catchAsync(async (req, res) => {
  /** Edit product request */

  await productService.editProduct(req.body, req.user);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const getAllProducts = catchAsync(async (req, res) => {
  logger.info('Inside getAllProducts');
  const filter = pick(req.query, ['category', 'bidStatus', 'minPrice', 'maxPrice']);
  const options = pick(req.query, ['limit', 'page', 'sort']);

  const products = await productService.getAllProducts(filter, options);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { products });
});

const getPendingProducts = catchAsync(async (req, res) => {
  logger.info('Inside getAllProducts');
  const filter = pick(req.query, ['category', 'minPrice', 'maxPrice']);
  const options = pick(req.query, ['limit', 'page', 'sort']);

  const products = await productService.getAllPendingProducts(filter, options);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { products });
});

const getCategories = catchAsync(async (req, res) => {
  /** Get Category Listing */
  const categories = await productService.getCategories();

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { categories });
});

const updateBid = catchAsync(async (req, res) => {
  /** Get Category Listing */
  await productService.updateBid(req.user, req.body);

  /** Update bid */
  const io = req.app.get('socket');
  io.emit(SocketEvents.UPDATE_BID, req.user);
  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

module.exports = {
  getCategories,
  addSellProductRequest,
  getProductDetails,
  updateBid,
  getAllProducts,
  getPendingProducts,
  editProduct,
};
