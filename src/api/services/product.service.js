const {
  constant,
  responseMessage,
  logger,
  apiError,
  aggregationPaginate,
} = require("../utils");
const resourceRepo = require("../dataRepositories/resourceRep");
const httpStatus = require("http-status");
const { ObjectId } = require("mongodb");
const { Product } = require("../models");

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
      logger.info("Invalid category id => ", body.categoryId);
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

function getAllUserProducts(args) {
  const filter = {
    createdBy: ObjectId(args[0]),
  };

  if (args[1].category) {
    filter.categoryId = ObjectId(args[1].category);
  }
  if (args[1].minPrice > -1 && args[1].maxPrice > args[1].minPrice) {
    filter.acceptedAmount = {
      $lte: args[1].maxPrice,
      $gte: args[1].minPrice,
    };
  }

  return filter;
}

/**
 * Generate Aggregate Query
 * @param {Object} filter
 * @returns {Promise<User>}
 */
const getUserProductsAggregateQuery = (filter) => {
  const query = [];

  /**
   * Query
   */
  query.push({
    $match: filter,
  });

  /**
   * Get Category detail
   */
  query.push(categoryLookupQuery());
  query.push({ $unwind: "$category" });

  query.push({ $sort: { createdAt: -1 } });

  const aggregate = Product.aggregate(query);
  return aggregate;
};

/**
 * categoryLookupQuery
 * @returns {Object}
 */
const categoryLookupQuery = () => {
  return {
    $lookup: {
      from: "categories",
      let: { model_id: "$categoryId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$model_id"] },
          },
        },
      ],
      as: "category",
    },
  };
};

/**
 * Execute aggregate query
 * @param {Object} aggregate - Mongo aggregate data
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const userProductsAggregation = async (aggregate, options) => {
  try {
    return resourceRepo.aggregatePaginate(constant.COLLECTIONS.PRODUCT, {
      aggregate,
      options,
    });
  } catch (error) {
    logger.error("userProductsAggregation error ", error);
    throw new apiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong, Please try again"
    );
  }
};

/**
 * Aggregate User Products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const aggregateUserProducts = async (filter, options) => {
  try {
    const aggregateQuery = getUserProductsAggregateQuery(filter);

    /**
     * Manage Pagination on  the aggregation query
     */
    const aggregate = await userProductsAggregation(aggregateQuery, options);

    /**
     * After getting data from the mongoose pagination, we are modifying some fields
     */
    return aggregationPaginate(aggregate);
  } catch (error) {
    logger.error("aggregateUserProducts error ", error);
    throw new apiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong, Please try again"
    );
  }
};

/**
 * Add sell request
 * @param {Object} body
 * @param {Object} user
 * @returns {Promise<Category>}
 */
const getProducts = async (...args) => {
  try {
    const query = getAllUserProducts(args);
    return await aggregateUserProducts(query, args[2]);
  } catch (error) {
    logger.error("getProducts error ", error);
    throw new apiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      responseMessage.QUERY_ERROR_MSG
    );
  }
};

module.exports = {
  getCategories,
  addSellRequest,
  getProducts,
};
