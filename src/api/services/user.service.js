const {
  constant,
  UserRole,
  aggregationPaginate,
  logger,
  responseMessage,
  apiError,
} = require("../utils");
const resourceRepo = require("../dataRepositories/resourceRep");
const { User } = require("../models");
const httpStatus = require("http-status");

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  searchQuery(filter);
  filter.role = { $ne: UserRole.ADMIN };
  hideExtraKeys(options);
  const users = await User.paginate(filter, options);
  return users;
};

function hideExtraKeys(option) {
  option.projection = {
    otp: 0,
    otpExpiry: 0,
    forgotPasswordOtp: 0,
    forgotPasswordOtpExpiry: 0,
    password: 0,
  };
}

/**
 * Get user by mobile or email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmailOrMobile = async (email, mobile) => {
  const queryData = [];
  if (mobile) {
    queryData.push({ mobile });
  }
  if (email) {
    queryData.push({ email });
  }
  const query = {
    $or: queryData,
  };

  return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

/**
 * Get user email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  const query = {
    email,
  };

  return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

/**
 * Get user by mobile
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByMobile = async (mobile) => {
  const query = {
    mobile,
  };

  return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const query = {
    _id: id,
  };

  return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

const searchQuery = (filter) => {
  if (filter.search) {
    filter["$or"] = [
      { name: { $regex: new RegExp(filter.search, "i") } },
      { email: { $regex: new RegExp(filter.search, "i") } },
    ];
  }
  delete filter.search;
  return filter;
};

/**
 * Generate Aggregate Query
 * @param {Object} filter
 * @returns {Promise<User>}
 */
const getUsersAggregateQuery = (filter) => {
  const query = [];

  /**
   * Query
   */
  query.push({
    $match: filter,
  });

  const aggregate = User.aggregate(query);
  return aggregate;
};

/**
 * Execute aggregate query
 * @param {Object} aggregate - Mongo aggregate data
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const usersAggregation = async (aggregate, options) => {
  return resourceRepo.aggregatePaginate(constant.COLLECTIONS.USER, {
    aggregate,
    options,
  });
};

/**
 * Aggregate Users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const aggregateUsers = async (filter, options) => {
  const aggregateQuery = getUsersAggregateQuery(filter);

  /**
   * Manage Pagination on  the aggregation query
   */
  const aggregate = await usersAggregation(aggregateQuery, options);

  /**
   * After getting data from the mongoose pagination, we are modifying some fields
   */
  return aggregationPaginate(aggregate);
};

/**
 * Aggregate Users listing
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Product>}
 */
const getUsers = async (filter, options) => {
  const query = searchQuery(filter);
  return await aggregateUsers(query, options);
};

/**
 * Execute aggregate query
 * @param {String} id - user id
 * @returns {Promise<User>}
 */
const getUserprofile = async (id) => {
  const user = await getUserById(id);

  if (!user) {
    logger.error("User not found with the id ", id);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  return user;
};

module.exports = {
  getUserByEmailOrMobile,
  getUserByEmail,
  getUserById,
  getUserByMobile,
  getUsers,
  queryUsers,
  getUserprofile,
};
