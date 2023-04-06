const jwt = require('jsonwebtoken');
const { constant } = require('../utils');

/**
 * Generate token
 * @param {ObjectId} payload
 * @param {string} secret
 * @param {Object} options
 * @returns {string}
 */
const generateToken = (payload, secret, options) => {
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
