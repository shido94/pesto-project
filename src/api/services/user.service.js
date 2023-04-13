const {
  constant,
  UserRole,
  aggregationPaginate,
  logger,
  responseMessage,
  apiError,
  randomNumberGenerator,
  setTimeFactory,
  ExpiryUnit,
} = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRepo');
const { User } = require('../models');
const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const paymentService = require('./payment.service');

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
    _id: ObjectId(id),
  };

  return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

const searchQuery = (filter) => {
  if (filter.search) {
    filter['$or'] = [
      { name: { $regex: new RegExp(filter.search, 'i') } },
      { email: { $regex: new RegExp(filter.search, 'i') } },
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
    logger.error('User not found with the id ', id);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  const getTotalUserEarning = await paymentService.getTotalUserEarning(id);

  return { user, totalEarning: getTotalUserEarning };
};

/**
 * Update user profile
 * @param {String} userId - user id
 * @param {Object} profile
 * @returns {Promise<User>}
 */
const updateUserprofile = async (userId, body) => {
  const user = await getUserById(userId);

  if (!user) {
    logger.error('User not found with the id ', userId);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  const dbUser = await getUserByEmailOrMobile(body.email);
  /** Check if user exists */
  if (dbUser && dbUser._id.toString() !== userId.toString()) {
    logger.error('User already exist with email or mobile');
    throw new apiError(httpStatus.BAD_GATEWAY, responseMessage.USER_ALREADY_EXIST);
  }

  const query = {
    _id: ObjectId(userId),
  };

  await resourceRepo.updateOne(constant.COLLECTIONS.USER, { query, data: body });

  const customerPayload = {
    name: body.name,
    mobile: user.mobile,
    email: body.email,
  };

  await paymentService.updateCustomer(user.customerId, customerPayload);
};

/**
 * Report user account
 * @param {Object} body
 * @returns null
 */
const blockUserAccount = async (body) => {
  const query = {
    _id: ObjectId(body.id),
  };

  const data = {
    isReported: body.isReported,
    reasonForReporting: body.reason,
  };
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, { query, data });
};

/**
 * Update user profile
 * @param {String} userId - user id
 * @param {Object} profile
 * @returns {Promise<User>}
 */
const updateUserMobile = async (userId, body) => {
  const user = await getUserById(userId);

  if (!user) {
    logger.error('User not found with the id ', userId);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  if (user.mobile === body.mobile) {
    logger.error('Mobile number exists ', userId);
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.MOBILE_EXIST);
  }

  const otp = randomNumberGenerator(4);
  const otpExpiry = setTimeFactory(new Date(), +constant.TOKEN_EXPIRATION, ExpiryUnit.MINUTE);

  /** update otp data */
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
    query: {
      _id: user._id,
    },
    data: {
      tempMobile: body.mobile,
      updateMobileOtp: otp,
      updateMobileOtpExpiry: otpExpiry,
    },
  });
};

/**
 * Verify update mobile otp
 * @param {String} userId
 * @param {String} otp
 * @returns true/false
 */
const verifyUpdateMobileOtp = async (userId, otp) => {
  logger.debug('Inside verifyUpdateMobileOtp');
  try {
    const user = await getUserById(userId);

    if (!user.tempMobile || !user.updateMobileOtp || !user.updateMobileOtpExpiry) {
      logger.error('Already verified');
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_REQUEST);
    }

    // TODO - remove static otp
    if (otp != constant.FAKE_OTP) {
      logger.error('Invalid otp');
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INCORRECT_OTP);
    }

    /** Check Expiry */
    if (user.updateMobileOtpExpiry < new Date().toISOString()) {
      logger.error('otp expired');
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.OTP_EXPIRED);
    }

    /** update otp data */
    await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
      query: {
        _id: user._id,
      },
      data: {
        updateMobileOtp: '',
        updateMobileOtpExpiry: '',
        mobile: user.tempMobile,
        tempMobile: '',
      },
    });

    const customerPayload = {
      name: user.name,
      mobile: user.tempMobile,
      email: user.email,
    };

    await paymentService.updateCustomer(user.customerId, customerPayload);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {String} userId - user id
 * @param {Object} profile
 * @returns {Promise<User>}
 */
const resendMobileChangeOtp = async (userId) => {
  const user = await getUserById(userId);

  if (!user.updateMobileOtp || !user.updateMobileOtpExpiry || !user.tempMobile) {
    logger.error('Can not send mobile change otp');
    throw new apiError(httpStatus.BAD_GATEWAY, responseMessage.INVALID_REQUEST);
  }

  const otp = randomNumberGenerator(4);
  const otpExpiry = setTimeFactory(new Date(), +constant.TOKEN_EXPIRATION, ExpiryUnit.MINUTE);

  /** update otp data */
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
    query: {
      _id: user._id,
    },
    data: {
      updateMobileOtp: otp,
      updateMobileOtpExpiry: otpExpiry,
    },
  });
};

/**
 * Update user profile
 * @param {String} userId - user id
 * @param {Object} profile
 * @returns {Promise<User>}
 */
const updateFund = async (userId, body) => {
  const user = await getUserById(userId);

  if (!user) {
    logger.error('User not found with the id ', userId);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  body.customerId = user.customerId;
  const fund = await paymentService.addUserFundAccount(body);

  /** update funds in db */
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
    query: {
      _id: user._id,
    },
    data: {
      bankAccountNumber: body.bankAccountNumber || '',
      ifscCode: body.ifscCode || '',
      accountHolderName: body.accountHolderName || '',
      UPI: body.UPI || '',
      fundAccountId: fund.id,
    },
  });
};

/**
 * Update user profile
 * @param {String} userId - user id
 * @param {Object} profile
 * @returns {Promise<User>}
 */
const updateNewPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await getUserById(userId);

  if (!user) {
    logger.error('User not found with the id ', userId);
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  if (!(await user.isPasswordMatch(currentPassword))) {
    logger.info('Invalid Password');
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INCORRECT_CURRENT_PASSWORD);
  }

  /** update funds in db */
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
    query: {
      _id: user._id,
    },
    data: {
      password: newPassword,
    },
  });
};

module.exports = {
  getUserByEmailOrMobile,
  getUserByEmail,
  getUserById,
  getUserByMobile,
  getUsers,
  queryUsers,
  getUserprofile,
  updateUserprofile,
  blockUserAccount,
  updateUserMobile,
  verifyUpdateMobileOtp,
  updateFund,
  getUserByEmailOrMobile,
  updateNewPassword,
  resendMobileChangeOtp,
};
