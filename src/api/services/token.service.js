const jwt = require('jsonwebtoken');
const { constant, UserRole } = require('../utils');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = ({ payload, secret = constant.ACCESS_TOKEN_SECRET, options }) => {
  return jwt.sign(payload, secret, options);
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = (userId, role = UserRole.USER) => {
  const payload = {
    sub: userId,
    role: role,
  };

  const accessToken = generateToken({
    payload,
    options: { expiresIn: constant.ACCESS_TOKEN_EXPIRATION },
  });

  const refreshToken = generateToken({
    payload,
    secret: constant.REFRESH_TOKEN_SECRET,
    options: { expiresIn: constant.REFRESH_TOKEN_EXPIRATION },
  });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

module.exports = {
  generateToken,
  generateAuthTokens,
};
