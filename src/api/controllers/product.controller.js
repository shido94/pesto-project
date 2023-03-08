const httpStatus = require('http-status');
const { pick, catchAsync, responseMessage } = require('../utils');
const { productService } = require('../services');
const { responseHandler } = require('../handlers');

const getProductDetails = catchAsync(async (req, res) => {
  const product = await productService.getProductDetails(req.params.id);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { product });
});

const addSellProductRequest = catchAsync(async (req, res) => {
  /** Add user to DB */

  await productService.addSellRequest(req.body, req.user);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

const getCategories = catchAsync(async (req, res) => {
  /** Get Category Listing */
  const categories = await productService.getCategories();

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS, { categories });
});

const updateBid = catchAsync(async (req, res) => {
  /** Get Category Listing */
  await productService.updateBid(req.user, req.body);

  return responseHandler.sendSuccess(res, httpStatus.OK, responseMessage.SUCCESS);
});

module.exports = {
  getCategories,
  addSellProductRequest,
  getProductDetails,
  updateBid,
};
