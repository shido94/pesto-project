const httpStatus = require('http-status');
const userService = require('./user.service');
const paymentService = require('./payment.service');
const {
  responseMessage,
  constant,
  apiError,
  logger,
  randomNumberGenerator,
  setTimeFactory,
  ExpiryUnit,
  UserRole,
} = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRepo');

/**
 * Register user
 * @param {Object} body
 * @returns object
 */
const register = async (body) => {
  logger.debug('Inside register');
  try {
    /** Check if user exists */
    if (await userService.getUserByEmailOrMobile(body.email, body.mobile)) {
      logger.error('User already exist with email or mobile');
      throw new apiError(httpStatus.CONFLICT, responseMessage.USER_ALREADY_EXIST);
    }

    body.role = UserRole.USER;
    body.otp = randomNumberGenerator(4);
    body.otpExpiry = setTimeFactory(new Date(), +constant.TOKEN_EXPIRATION, ExpiryUnit.MINUTE);

    /** Create new razor pay customer */
    const customer = await paymentService.addCustomer(body);
    body.customerId = customer.id;

    if (body.UPI || body.bankAccountNumber) {
      const fund = await paymentService.addUserFundAccount(body);
      body.fundAccountId = fund.id;
    }

    /** Create new user */
    return resourceRepo.create(constant.COLLECTIONS.USER, {
      data: body,
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

/**
 * Verify Auth Otp
 * @param {Object} body
 * @returns true/false
 */
const verifyAuthOtp = async ({ userId, otp }) => {
  logger.debug('Inside verifyAuthOtp');
  try {
    const user = await userService.getUserById(userId);

    if (!user.otp || !user.otpExpiry) {
      logger.error('Already verified');
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_REQUEST);
    }

    // TODO - remove static otp
    if (otp != constant.FAKE_OTP) {
      logger.error('Invalid otp');
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INCORRECT_OTP);
    }

    /** Check Expiry */
    if (user.otpExpiry < new Date().toISOString()) {
      logger.error('otp expired');
      throw new apiError(httpStatus.BAD_REQUEST, responseMessage.OTP_EXPIRED);
    }

    /** update otp data */
    await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
      query: {
        _id: user._id,
      },
      data: {
        otp: '',
        otpExpiry: '',
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Login with mobile
 * @param {string} mobile
 * @returns {Promise<User>}
 */
const login = async (mobile) => {
  logger.info('Inside login');
  const user = await userService.getUserByMobile(mobile);

  if (!user) {
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  if (user.isReported) {
    throw new apiError(httpStatus.CONFLICT, responseMessage.BLOCKED);
  }

  const otp = randomNumberGenerator(4);
  const otpExpiry = setTimeFactory(new Date(), +constant.TOKEN_EXPIRATION, ExpiryUnit.MINUTE);

  /** update otp data */
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
    query: {
      _id: user._id,
    },
    data: {
      otp: otp,
      otpExpiry: otpExpiry,
    },
  });

  return user;
};

/**
 * Login with mobile
 * @param {string} mobile
 * @returns {Promise<User>}
 */
const resendAuthUserOtp = async (userId) => {
  logger.info('Inside login');
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  if (user.isReported) {
    throw new apiError(httpStatus.CONFLICT, responseMessage.BLOCKED);
  }

  if (!user.otp) {
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_REQUEST);
  }

  const otp = randomNumberGenerator(4);
  const otpExpiry = setTimeFactory(new Date(), +constant.TOKEN_EXPIRATION, ExpiryUnit.MINUTE);

  /** update otp data */
  await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
    query: {
      _id: user._id,
    },
    data: {
      otp: otp,
      otpExpiry: otpExpiry,
    },
  });

  return user;
};

module.exports = {
  register,
  verifyAuthOtp,
  login,
  resendAuthUserOtp,
};
