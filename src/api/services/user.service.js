const { constant, UserRole } = require("../utils");
const resourceRepo = require("../dataRepositories/resourceRep");
const { User } = require("../models");

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

const getUsers = async (args) => {
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
  getUserByEmailOrMobile,
  getUserByEmail,
  getUserById,
  getUserByMobile,
  getUsers,
  queryUsers,
};
