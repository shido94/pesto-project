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
const { forgotPasswordOtp } = require('./otp.service');
const { sendForgotPasswordOtp } = require('./email.service');
const tokenService = require('./token.service');

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
      throw new apiError(httpStatus.BAD_GATEWAY, responseMessage.USER_ALREADY_EXIST);
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
const resetPassword = async ({ userId, otp, password }) => {
  logger.debug('Inside resetPassword');
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
        password: password,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Login with mobile and password
 * @param {Object} body
 * @returns {Promise<User>}
 */
const login = async (body) => {
  const { mobile, email, password } = body;

  logger.info('Inside login');
  const user = await userService.getUserByEmailOrMobile(email, mobile);

  if (!user) {
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  if (user.isReported) {
    throw new apiError(httpStatus.BAD_GATEWAY, responseMessage.BLOCKED);
  }

  if (!user.password) {
    throw new apiError(httpStatus.BAD_GATEWAY, responseMessage.MISSING_PASSWORD);
  }

  if (!(await user.isPasswordMatch(password))) {
    logger.info('Invalid Password');
    throw new apiError(httpStatus.BAD_REQUEST, responseMessage.INVALID_CREDENTIAL_MSG);
  }

  const tokens = tokenService.generateAuthTokens(user._id);

  return {
    tokens,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
    },
  };
};

/**
 * Resend otp
 * @param {string} mobile
 * @returns {Promise<User>}
 */
const resendResetPasswordOtp = async (userId) => {
  logger.info('Inside login');
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
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

const forgotPassword = async (body) => {
  const { email, mobile } = body;
  logger.info('Inside forgotPassword');
  const user = await userService.getUserByEmailOrMobile(email, mobile);

  if (!user) {
    throw new apiError(httpStatus.NOT_FOUND, responseMessage.NO_USER_FOUND);
  }

  const otp = randomNumberGenerator(4);
  const otpExpiry = setTimeFactory(new Date(), +constant.TOKEN_EXPIRATION, ExpiryUnit.MINUTE);

  if (mobile) {
    forgotPasswordOtp(mobile, otp);
  } else {
    sendForgotPasswordOtp(user, otp);
  }

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
 * Resend otp
 * @param {string} mobile
 * @returns {Promise<User>}
 */
const refreshAuthToken = async (token) => {
  logger.info('Inside login');

  try {
    const tokenData = await tokenService.verifyRefreshToken(token);

    const user = userService.getUserById(tokenData.sub);
    if (!user) {
      throw new apiError(httpStatus.UNAUTHORIZED, responseMessage.OTP_EXPIRED);
    }

    return tokenService.generateAuthTokens(user._id);
  } catch (error) {
    logger.error(error);
    throw new apiError(httpStatus.UNAUTHORIZED, responseMessage.INVALID_TOKEN);
  }
};

module.exports = {
  register,
  resetPassword,
  login,
  resendResetPasswordOtp,
  forgotPassword,
  refreshAuthToken,
};
