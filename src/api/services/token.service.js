const jwt = require('jsonwebtoken');
const { constant, UserRole, generateToken, verifyToken } = require('../utils');

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

  const accessToken = generateToken(payload, constant.ACCESS_TOKEN_SECRET, {
    expiresIn: constant.ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = generateToken(payload, constant.REFRESH_TOKEN_SECRET, {
    expiresIn: constant.REFRESH_TOKEN_EXPIRATION,
  });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, constant.REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateToken,
  generateAuthTokens,
  verifyRefreshToken,
};
