const httpStatus = require('http-status');
const userService = require('./user.service');
const {
  logger,
  apiError,
  responseMessage,
  constant,
  UserRole,
} = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRep');

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const login = async (email, password) => {
  logger.info('Inside admin login');
  const user = await userService.getUserByEmail(email);

  if (!user) {
    logger.info('Invalid Email => ', email);
    throw new apiError(
      httpStatus.UNAUTHORIZED,
      responseMessage.INVALID_CREDENTIAL_MSG
    );
  }

  if (
    !(await user.isPasswordMatch(password)) ||
    !(user.role === UserRole.ADMIN)
  ) {
    logger.info('Invalid Password');
    throw new apiError(
      httpStatus.UNAUTHORIZED,
      responseMessage.INVALID_CREDENTIAL_MSG
    );
  }
  return user;
};

module.exports = {
  login,
};
