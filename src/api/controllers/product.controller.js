const httpStatus = require('http-status');
const { pick, catchAsync, responseMessage } = require('../utils');
const { productService } = require('../services');
const { responseHandler } = require('../handlers');

const getProducts = catchAsync(async (req, res) => {
  /** Add user to DB */
  const products = {
    name: 'rupesh',
  };

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { products }
  );
});

const addSellProductRequest = catchAsync(async (req, res) => {
  /** Add user to DB */

  await productService.addSellRequest(req.body, req.user);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS
  );
});

const getCategories = catchAsync(async (req, res) => {
  /** Get Category Listing */
  const categories = await productService.getCategories();

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { categories }
  );
});

module.exports = {
  getProducts,
  getCategories,
  addSellProductRequest,
};
