const {
  constant,
  responseMessage,
  logger,
  apiError,
  aggregationPaginate,
  ProductBidStatus,
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
 * Get category by id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  const query = {
    _id: ObjectId(id),
  };
  return resourceRepo.findOne(constant.COLLECTIONS.CATEGORY, { query });
};

/**
 * Get product by id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  const query = {
    _id: ObjectId(id),
  };
  return resourceRepo.findOne(constant.COLLECTIONS.PRODUCT, { query });
};

/**
 * Get product by id
 * @returns {Promise<ProductBidHistory>}
 */
const getProductBidHistoryByProductId = async (id) => {
  const query = {
    productId: ObjectId(id),
  };
  return resourceRepo.findOne(constant.COLLECTIONS.BID_HISTORY, { query });
};

/**
 * Add sell request
 * @param {Object} body
 * @param {Object} user
 * @returns {Promise<Category>}
 */
const addSellRequest = async (body, user) => {
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
  return resourceRepo.aggregatePaginate(constant.COLLECTIONS.PRODUCT, {
    aggregate,
    options,
  });
};

/**
 * Aggregate User Products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const aggregateUserProducts = async (filter, options) => {
  const aggregateQuery = getUserProductsAggregateQuery(filter);

  /**
   * Manage Pagination on  the aggregation query
   */
  const aggregate = await userProductsAggregation(aggregateQuery, options);

  /**
   * After getting data from the mongoose pagination, we are modifying some fields
   */
  return aggregationPaginate(aggregate);
};

/**
 * Add sell request
 * @param {Array} args
 * @returns {Promise<Category>}
 */
const getProducts = async (...args) => {
  const query = getAllUserProducts(args);
  return await aggregateUserProducts(query, args[2]);
};

/**
 * Add sell request
 * @param {Object} user
 * @param {Object} body
 * @returns {Promise<Product>}
 */
const createNewBid = async (user, body) => {
  const productBidHistory = await getProductBidHistoryByProductId(
    body.productId
  );

  /** Check if product exists */
  if (productBidHistory) {
    logger.info("Invalid product id => ", body.productId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_PRODUCT);
  }

  const data = [
    {
      productId: body.productId,
      bidCreatedBy: user.sub,
      newValue: body.offeredAmount,
      bidStatus: ProductBidStatus.CREATED,
    },
  ];

  /** Add new request */
  return resourceRepo.create(constant.COLLECTIONS.BID_HISTORY, {
    data,
  });
};

/**
 * Get Product details
 * @param {String} id
 * @returns {Promise<Product>}
 */
const getProductDetails = async (id) => {
  const query = [];
  /**
   * Query
   */
  query.push({
    $match: {
      _id: ObjectId(id),
    },
  });

  /**
   * Get Category detail
   */
  query.push(categoryLookupQuery());
  query.push({ $unwind: "$category" });

  query.push(changeHistoryLookupQuery());

  const products = await Product.aggregate(query);

  /** Check if product exists */
  if (products && products.length) {
    return products[0];
  }

  logger.info("Invalid product id => ", id);
  throw new apiError(httpStatus.NOT_FOUND, responseMessage.PRODUCT_NOT_FOUND);
};

/**
 * changeHistoryLookupQuery
 * @returns {Object}
 */
const changeHistoryLookupQuery = () => {
  const pipelineQuery = [];

  /**
   * Add filter
   */
  pipelineQuery.push({
    $match: {
      $expr: { $eq: ["$$model_id", "$productId"] },
    },
  });

  /**
   * Lookup editor
   */
  pipelineQuery.push(bidderLookupQuery());
  pipelineQuery.push({ $unwind: "$bidCreatedBy" });

  /**
   * Lookup responder
   */
  pipelineQuery.push(responderLookupQuery());
  pipelineQuery.push({
    $unwind: {
      path: "$responder",
      preserveNullAndEmptyArrays: true,
    },
  });

  /**
   * Sort by updated data
   */
  pipelineQuery.push({ $sort: { updatedAt: -1 } });

  return {
    $lookup: {
      from: "productbidhistories",
      let: { model_id: "$_id" },
      pipeline: pipelineQuery,
      as: "bidHistory",
    },
  };
};

const bidderLookupQuery = () => {
  return {
    $lookup: {
      from: "users",
      let: { model_id: "$bidCreatedBy" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$model_id"] },
          },
        },
        {
          $project: {
            email: 1,
            mobile: 1,
            role: 1,
            profileUri: 1,
            name: 1,
          },
        },
      ],
      as: "bidCreatedBy",
    },
  };
};

const responderLookupQuery = () => {
  return {
    $lookup: {
      from: "users",
      let: { model_id: "$respondedBy" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$model_id"] },
          },
        },
        {
          $project: {
            email: 1,
            mobile: 1,
            role: 1,
            profileUri: 1,
            name: 1,
          },
        },
      ],
      as: "responder",
    },
  };
};

module.exports = {
  getCategories,
  addSellRequest,
  getProducts,
  createNewBid,
  getProductDetails,
};
