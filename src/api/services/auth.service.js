const httpStatus = require('http-status');
const userService = require('./user.service');
const tokenService = require('./token.service');
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
const resourceRepo = require('../dataRepositories/resourceRep');

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
      throw new apiError(
        httpStatus.CONFLICT,
        responseMessage.USER_ALREADY_EXIST
      );
    }

    body.role = UserRole.USER;
    body.otp = randomNumberGenerator(4);
    body.otpExpiry = setTimeFactory(
      new Date(),
      +constant.TOKEN_EXPIRATION,
      ExpiryUnit
    );

    /** Create new user */
    return resourceRepo.create(constant.COLLECTIONS.USER, {
      data: body,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Register user
 * @param {Object} body
 * @returns true/false
 */
const verifyAuthOtp = async ({ userId, otp }) => {
  logger.debug('Inside verifyAuthOtp');
  try {
    const user = await userService.getUserById(userId);
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

  if (user.isReported) {
    throw new apiError(httpStatus.CONFLICT, responseMessage.BLOCKED);
  }

  const otp = randomNumberGenerator(4);
  const otpExpiry = setTimeFactory(
    new Date(),
    +constant.TOKEN_EXPIRATION,
    ExpiryUnit
  );

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
 * Get user with email or mobile
 * @param {string} email
 * @param {string} mobile
 * @returns true/false
 */
const checkUserWithEmailOrMobile = async (email, mobile) => {
  logger.debug(
    'Inside checkUserWithEmailOrMobile, Email = ' +
      email +
      ' and Mobile = ' +
      mobile
  );

  /** Check if user exists */
  if (await userService.getUserByEmailOrMobile(email, mobile)) {
    throw new apiError(httpStatus.CONFLICT, responseMessage.USER_ALREADY_EXIST);
  }

  logger.info('User not found inside checkUserWithEmailOrMobile ');
  return true;
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyRefreshToken(refreshToken);

    logger.info('refreshTokenDoc ' + refreshTokenDoc);
    const user = await userService.getUserById(refreshTokenDoc.sub);
    if (!user) {
      throw new Error();
    }
    return tokenService.generateAuthTokens(user._id);
  } catch (error) {
    throw new apiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Forgot Password
 * @param {Object} body
 * @returns object
 */
const forgotPassword = async ({ mobile }) => {
  logger.debug('Inside register');
  try {
    /** Check if user exists */
    const user = await userService.getUserByMobile(mobile);
    if (!user) {
      logger.error('User not found with mobile => ', mobile);
      throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
    }

    const otp = randomNumberGenerator(4);
    const otpExpiry = setTimeFactory(
      new Date(),
      +constant.TOKEN_EXPIRATION,
      ExpiryUnit
    );

    /** update otp data */
    await resourceRepo.updateOne(constant.COLLECTIONS.USER, {
      query: {
        _id: user._id,
      },
      data: {
        forgotPasswordOtp: otp,
        forgotPasswordOtpExpiry: otpExpiry,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  verifyAuthOtp,
  login,
  checkUserWithEmailOrMobile,
  refreshAuth,
  forgotPassword,
};
