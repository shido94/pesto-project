const {
  constant,
  responseMessage,
  logger,
  apiError,
  aggregationPaginate,
  ProductBidStatus,
  OrderStatus,
  eventEmitter,
  Events,
} = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRepo');
const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const { Product, Category } = require('../models');
const ProductBidHistory = require('../models/product.bid.history.model');
const { default: mongoose } = require('mongoose');
const dayjs = require('dayjs');
const paymentService = require('./payment.service');
const { getUserById } = require('./user.service');

/**
 * Get Categories
 * @returns {Promise<Category>}
 */
const getCategories = async () => {
  const query = [];
  query.push({
    $match: {
      parentId: { $exists: false },
    },
  });

  /**
   * Get Category detail
   */
  query.push(subCategoryLookupQuery());

  return await Promise.resolve(Category.aggregate(query));
};

/**
 * Get All Categories query
 * @returns {Promise<Category>}
 */
const getCategoriesByQuery = async (query) => {
  return resourceRepo.find(constant.COLLECTIONS.CATEGORY, { query });
};

/**
 * Get All Products by query
 * @returns {Promise<Products>}
 */
const getProductsByQuery = async (query) => {
  return resourceRepo.find(constant.COLLECTIONS.PRODUCT, { query });
};

/**
 * Get category by id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  try {
    const query = [];
    query.push({
      $match: {
        _id: ObjectId(id),
      },
    });

    /**
     * Get Category detail
     */
    query.push(subCategoryLookupQuery());

    const categories = await Promise.resolve(Category.aggregate(query));

    /** Check if product exists */
    return categories[0];
  } catch (error) {
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_CATEGORY);
  }
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
 * @returns {Promise<Product>}
 */
const getUserProductById = async (productId, userId) => {
  const query = {
    _id: ObjectId(productId),
    createdBy: ObjectId(userId),
  };
  return resourceRepo.findOne(constant.COLLECTIONS.PRODUCT, { query });
};

const creatorLookupQuery = () => {
  return {
    $lookup: {
      from: 'users',
      let: { model_id: '$createdBy' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$model_id'] },
          },
        },
        {
          $project: {
            email: 1,
            mobile: 1,
            role: 1,
            profileUri: 1,
            name: 1,
            fundAccountId: 1,
          },
        },
      ],
      as: 'createdByDetails',
    },
  };
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
    logger.info('Invalid category id => ', body.categoryId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_CATEGORY);
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
  const product = await resourceRepo.create(constant.COLLECTIONS.PRODUCT, { data });

  await eventEmitter.emit(Events.ADD_PRODUCT, user.sub, product);
};

/**
 * Edit sell request
 * @param {Object} body
 * @param {Object} user
 * @returns {Promise<Category>}
 */
const editProduct = async (body, user) => {
  const category = await getCategoryById(body.categoryId);
  if (!category) {
    logger.info('Invalid category id => ', body.categoryId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_CATEGORY);
  }

  const product = await getProductDetailsById(body.productId);

  if (product.bidHistory.length) {
    logger.info('Bidding has started => ', body.productId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.BIDDING_STARTED);
  }

  const query = {
    _id: ObjectId(body.productId),
  };

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
  await resourceRepo.updateOne(constant.COLLECTIONS.PRODUCT, { query, data });
};

function getProductsQuery(args) {
  const filter = {};

  if (args.category) {
    filter.categoryId = ObjectId(args.category);
  }
  if (args.bidStatus) {
    filter.bidStatus = +args.bidStatus;
  }
  if (args.orderStatus) {
    filter.orderStatus = +args.orderStatus;
  }
  if (args.minPrice || args.maxPrice) {
    const min = args.minPrice > -1 ? args.minPrice : 0;

    const query = {};

    if (min) {
      query['$gte'] = +min;
    }

    if (args.maxPrice) {
      query['$lte'] = +args.maxPrice;
    }

    filter.acceptedAmount = query;
  }

  return filter;
}

/**
 * Generate Aggregate Query
 * @param {Object} filter
 * @returns {Promise<Products>}
 */
const getProductsAggregateQuery = (filter) => {
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
  query.push({ $unwind: '$category' });

  /**
   * Get Created by details
   */
  query.push(creatorLookupQuery());
  query.push({ $unwind: '$createdByDetails' });

  query.push(changeHistoryLookupQuery());

  query.push({ $sort: { updatedAt: -1 } });

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
      from: 'categories',
      let: { model_id: '$categoryId' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$model_id'] },
          },
        },
      ],
      as: 'category',
    },
  };
};

/**
 * subCategoryLookupQuery
 * @returns {Object}
 */
const subCategoryLookupQuery = () => {
  return {
    $lookup: {
      from: 'categories',
      let: { model_id: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$parentId', '$$model_id'] },
          },
        },
      ],
      as: 'subCategories',
    },
  };
};

/**
 * Execute aggregate query
 * @param {Object} aggregate - Mongo aggregate data
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const productsAggregation = async (aggregate, options) => {
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
const aggregateProducts = async (filter, options) => {
  const aggregateQuery = getProductsAggregateQuery(filter);

  /**
   * Manage Pagination on  the aggregation query
   */
  const aggregate = await productsAggregation(aggregateQuery, options);

  /**
   * After getting data from the mongoose pagination, we are modifying some fields
   */
  return aggregationPaginate(aggregate);
};

/**
 * Get all products bu a userid
 * @param {Array} args
 * @returns {Promise<Product>}
 */
const getUserProducts = async (userId, filter = {}, options = {}) => {
  logger.info('Inside getUserProducts');
  const query = getProductsQuery(filter);

  /** Add user in filter */
  query.createdBy = ObjectId(userId);

  logger.info('Query generated');
  return await aggregateProducts(query, options);
};

/**
 * Get All products
 * @param {Array} args
 * @returns {Promise<Product>}
 */
const getAllProducts = async (filter, options) => {
  logger.info('Inside getAllProducts');
  const query = getProductsQuery(filter);
  logger.info('Query generated');
  return await aggregateProducts(query, options);
};

/**
 * Get All products
 * @param {Array} args
 * @returns {Promise<Product>}
 */
const getAllPendingProducts = async (filter, options) => {
  logger.info('Inside getAllProducts');

  const query = getProductsQuery(filter);

  /** Add pending query */
  query.bidStatus = ProductBidStatus.CREATED;

  logger.info('Query generated');
  return await aggregateProducts(query, options);
};

const addBid = async (body, user, session = null) => {
  const data = [
    {
      productId: body.productId,
      bidCreatedBy: user.sub,
      newValue: body.offeredAmount,
      bidStatus: ProductBidStatus.CREATED,
    },
  ];

  const options = {
    session,
  };

  /** Add new request */
  return resourceRepo.create(constant.COLLECTIONS.BID_HISTORY, {
    data,
    options,
  });
};

/**
 * Add sell request
 * @param {Object} user
 * @param {Object} body
 * @returns {Promise<ProductBidHistory>}
 */
const createNewBid = async (user, body) => {
  const productBidHistory = await getProductBidHistoryByProductId(body.productId);

  /** Check if product exists */
  if (productBidHistory) {
    logger.info('Invalid product id => ', body.productId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_PRODUCT);
  }

  await addBid(body, user);

  const product = await getProductById(body.productId);

  await eventEmitter.emit(Events.ADD_NEW_BID, user.sub, product);
};

/**
 * Get Product details
 * @param {String} id
 * @returns {Promise<Product>}
 */
const getProductDetailsById = async (id) => {
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
  query.push({ $unwind: '$category' });

  query.push(changeHistoryLookupQuery());

  const promise = Promise.resolve(Product.aggregate(query));

  const products = await promise;

  /** Check if product exists */
  if (products && products.length) {
    return products[0];
  }

  logger.info('Invalid product id => ', id);
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
      $expr: { $eq: ['$$model_id', '$productId'] },
    },
  });

  /**
   * Lookup editor
   */
  pipelineQuery.push(bidderLookupQuery());
  pipelineQuery.push({ $unwind: '$bidCreator' });

  /**
   * Lookup responder
   */
  pipelineQuery.push(responderLookupQuery());
  pipelineQuery.push({
    $unwind: {
      path: '$responder',
      preserveNullAndEmptyArrays: true,
    },
  });

  /**
   * Sort by updated data
   */
  pipelineQuery.push({ $sort: { updatedAt: -1 } });

  return {
    $lookup: {
      from: 'productbidhistories',
      let: { model_id: '$_id' },
      pipeline: pipelineQuery,
      as: 'bidHistory',
    },
  };
};

const bidderLookupQuery = () => {
  return {
    $lookup: {
      from: 'users',
      let: { model_id: '$bidCreatedBy' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$model_id'] },
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
      as: 'bidCreator',
    },
  };
};

const responderLookupQuery = () => {
  return {
    $lookup: {
      from: 'users',
      let: { model_id: '$respondedBy' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$model_id'] },
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
      as: 'responder',
    },
  };
};

/**
 * Get user email
 * @returns {Promise<ProductBidHistory>}
 */
const getBidDetailById = async (id) => {
  const query = [];

  /**
   * Query
   */
  query.push({
    $match: { _id: ObjectId(id) },
  });

  /**
   * Lookup editor
   */
  query.push(bidderLookupQuery());
  query.push({ $unwind: '$bidCreator' });

  /**
   * Lookup responder
   */
  query.push(responderLookupQuery());
  query.push({
    $unwind: {
      path: '$responder',
      preserveNullAndEmptyArrays: true,
    },
  });

  const bid = await ProductBidHistory.aggregate(query);
  return bid.length ? bid[0] : {};
};

/**
 * Modify a bid
 * @returns {Promise<ProductBidHistory>}
 */
const modifiedBid = async (user, body, session) => {
  try {
    /** Update response on bid */
    await updateResponseOnBid(user, body, session);

    /** Add new bid */
    await addBid(body, user, session);
  } catch (error) {
    throw error;
  }
};

const updateResponseOnBid = async (user, body, session) => {
  return resourceRepo.updateOne(constant.COLLECTIONS.BID_HISTORY, {
    query: {
      _id: ObjectId(body.bidId),
    },
    data: {
      respondedBy: user.sub,
      notes: body.notes,
      bidStatus: body.status,
    },
    options: { session },
  });
};

/**
 * Update a bid
 * @param {Object} body
 * @returns {null}
 */
const updateBid = async (user, body) => {
  const bid = await getBidDetailById(body.bidId);

  const session = await mongoose.startSession();
  session.startTransaction();

  let isTransactionStarted = false;

  try {
    if (!bid) {
      logger.info('Invalid bid id => ', id);
      throw new apiError(httpStatus.NOT_FOUND, responseMessage.BID_NOT_FOUND);
    }

    if (String(bid.bidCreatedBy) === user.sub || ![ProductBidStatus.CREATED].includes(bid.bidStatus)) {
      logger.info('Invalid user => ', user.sub);
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.BID_NOT_ALLOWED);
    }

    if (body.status === ProductBidStatus.MODIFIED) {
      body.productId = bid.productId;
      isTransactionStarted = true;
      await modifiedBid(user, body, session);
    } else {
      isTransactionStarted = true;
      /** Update response on bid */
      await updateResponseOnBid(user, body, session);
      const product = await getProductById(bid.productId);
      let priceAcceptedBy = '';

      if (product.createdBy.toString() === user.sub.toString()) {
        priceAcceptedBy = bid.bidCreatedBy;
      } else {
        priceAcceptedBy = user.sub;
      }

      /** Update status on product */
      await await resourceRepo.updateOne(constant.COLLECTIONS.PRODUCT, {
        query: { _id: bid.productId },
        data: {
          acceptedAmount: bid.newValue,
          bidStatus: body.status,
          priceAcceptedBy,
        },
        options: { session },
      });
    }

    await session.commitTransaction();
    session.endSession();

    await eventEmitter.emit(Events.BID_UPDATE, user.sub, bid, body.status);
  } catch (error) {
    // If an error occurred, abort the whole transaction and
    // undo any changes that might have happened
    if (isTransactionStarted) {
      await session.abortTransaction();
      session.endSession();
    }

    throw error;
  }
};

/**
 * Update Pickup Date
 * @param {Object} userId
 * @param {Object} body
 * @returns null
 */
const updatePickUpDate = async (userId, body) => {
  const product = await getProductById(body.productId);

  /** Check if product exist */
  if (!product) {
    logger.error('Invalid product id => ', body.productId);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.PRODUCT_NOT_FOUND);
  }

  /** Check if product amount has been accepted */
  if (product.bidStatus !== ProductBidStatus.ACCEPTED) {
    logger.error(responseMessage.PRODUCT_NOT_ACCEPTED, body.productId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.PRODUCT_NOT_ACCEPTED);
  }

  /** Check if order is still in pending state */
  if (![OrderStatus.PENDING, OrderStatus.PICKED_UP_DATE_ESTIMATED].includes(product.orderStatus)) {
    logger.error('Invalid product id => ', body.productId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.PRODUCT_NOT_FOUND);
  }

  const query = {
    _id: ObjectId(body.productId),
  };

  const data = {
    orderStatus: OrderStatus.PICKED_UP_DATE_ESTIMATED,
    pickedUpDate: dayjs(body.estimatedPickedUpDate).format(),
  };

  await resourceRepo.updateOne(constant.COLLECTIONS.PRODUCT, { query, data });

  await eventEmitter.emit(Events.ORDER_UPDATE, userId, product, OrderStatus.PICKED_UP_DATE_ESTIMATED);
};

/**
 * Order pickedUp
 * @param {Object} body
 * @returns null
 */
const orderPickedUp = async (userId, body) => {
  const product = await getProductById(body.productId);

  /** Check if product exist */
  if (!product) {
    logger.info('Invalid product id => ', body.productId);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.PRODUCT_NOT_FOUND);
  }

  /** Check if product amount has been accepted */
  if (product.bidStatus !== ProductBidStatus.ACCEPTED) {
    logger.error('Product has been accepted yet');
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.PRODUCT_NOT_ACCEPTED);
  }

  /** Check if order is still in pending state */
  if (product.orderStatus !== OrderStatus.PICKED_UP_DATE_ESTIMATED) {
    logger.error(`Order status is = `, product.orderStatus);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.PICKED_UP_NOT_ESTIMATED);
  }

  const query = {
    _id: ObjectId(body.productId),
  };

  const data = {
    orderStatus: OrderStatus.PICKED_UP,
  };

  await resourceRepo.updateOne(constant.COLLECTIONS.PRODUCT, { query, data });

  await eventEmitter.emit(Events.ORDER_UPDATE, userId, product, OrderStatus.PICKED_UP);
};

/**
 * Order pickedUp
 * @param {Object} body
 * @returns null
 */
const makePayoutToUser = async (paidBy, body) => {
  const products = await getProductsAggregateQuery({ _id: ObjectId(body.productId), createdBy: ObjectId(body.userId) });
  const product = products.length ? products[0] : {};

  /** Check if product exist */
  if (!product) {
    logger.info('No Product found with this user => ', id);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.PRODUCT_NOT_FOUND);
  }

  /** Check if product amount has been accepted */
  if (product.bidStatus !== ProductBidStatus.ACCEPTED) {
    logger.error('Product has been accepted yet => ');
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.PRODUCT_NOT_ACCEPTED);
  }

  /** Check if order is still in pending state */
  if (product.orderStatus === OrderStatus.PAID) {
    logger.error(`Order status is = `, product.orderStatus);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.PRODUCT_PAID);
  }

  /** Check if order is still in pending state */
  if (product.orderStatus !== OrderStatus.PICKED_UP) {
    logger.error(`Order status is = `, product.orderStatus);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.PRODUCT_NOT_PICKED);
  }

  const user = await getUserById(paidBy);

  if (!user || !user.bankAccountNumber || !user.UPI) {
    logger.error(`Funds account pending`);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.BANK_DETAIL_MISSING);
  }

  const payment = await paymentService.createPayment(paidBy, product);

  const query = {
    _id: ObjectId(body.productId),
  };
  const data = {
    orderStatus: OrderStatus.PAID,
  };

  await resourceRepo.updateOne(constant.COLLECTIONS.PRODUCT, { query, data });

  await eventEmitter.emit(Events.ORDER_UPDATE, paidBy, product, OrderStatus.PAID);
};

/**
 * Get Categories
 * @returns {Promise<Category>}
 */
const addCategory = async (body) => {
  if (body.parentId) {
    const category = await getCategoryById(body.parentId);
    if (!category) {
      logger.error(`Invalid parent category id`);
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_CATEGORY);
    }
  }

  const data = {
    parentId: body.parentId,
    name: body.name,
    logo: body.logo,
    isActive: body.isActive,
  };

  return resourceRepo.create(constant.COLLECTIONS.CATEGORY, { data });
};

/**
 * Delete Categories
 * @param {String} categoryId
 * @returns {Promise<Category>}
 */
const deleteCategory = async ({ categoryId }) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    logger.error(`Invalid category id`);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_CATEGORY);
  }

  if (category.subCategories.length) {
    logger.error(`Invalid parent category id`);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.CAN_NOT_DELETE_CATEGORY);
  }

  const query = {
    _id: ObjectId(categoryId),
  };
  return resourceRepo.remove(constant.COLLECTIONS.CATEGORY, { query });
};

module.exports = {
  getCategories,
  addSellRequest,
  getUserProducts,
  createNewBid,
  getProductDetailsById,
  updateBid,
  getAllProducts,
  getAllPendingProducts,
  updatePickUpDate,
  orderPickedUp,
  makePayoutToUser,
  editProduct,
  getProductById,
  getUserProductById,
  getProductBidHistoryByProductId,
  addCategory,
  deleteCategory,
  getCategoriesByQuery,
  getProductsByQuery,
};
