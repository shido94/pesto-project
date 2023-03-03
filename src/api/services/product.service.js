const { constant, responseMessage, logger, apiError } = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRep');
const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');

/**
 * Get user email
 * @returns {Promise<Category>}
 */
const getCategories = async () => {
  return resourceRepo.find(constant.COLLECTIONS.CATEGORY, {});
};

/**
 * Get user email
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  const query = {
    _id: ObjectId(id),
  };
  return resourceRepo.findOne(constant.COLLECTIONS.CATEGORY, { query });
};

/**
 * Add sell request
 * @param {Object} body
 * @param {Object} user
 * @returns {Promise<Category>}
 */
const addSellRequest = async (body, user) => {
  try {
    const category = await getCategoryById(body.categoryId);
    if (!category) {
      logger.info('Invalid category id => ', body.categoryId);
      throw new apiError(
        httpStatus.BAD_REQUEST,
        responseMessage.INVALID_CATEGORY
      );
    }

    const data = {
      categoryId: body.categoryId,
      type: body.type,
      title: body.title,
      description: body.description,
      brand: body.brand,
      purchasedYear: body.purchasedYear,
      distanceDriven: body.distanceDriven,
      offeredAmount: body.offeredAmount,
      createdBy: user.sub,
      pickupAddress: body.pickupAddress,
      images: body.images,
    };

    /** Add new  product request */
    await resourceRepo.create(constant.COLLECTIONS.PRODUCT, { data });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getCategories,
  addSellRequest,
};
