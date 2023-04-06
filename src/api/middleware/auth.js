const httpStatus = require('http-status');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { constant, apiError, logger } = require('../utils');

const verifyUserRolesCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new apiError(httpStatus.FORBIDDEN, 'Token expired'));
  }

  req.user = user;

  if (requiredRights.length) {
    const hasRequiredRights = requiredRights.includes(user.role);
    if (!hasRequiredRights) {
      return reject(new apiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      const token = req?.headers?.authorization?.split(' ')[1];

      jwt.verify(token, constant.ACCESS_TOKEN_SECRET, verifyUserRolesCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        next,
      );
    })
      .then(() => next())
      .catch((error) => {
        logger.error(error);
        next(error);
      });
  };

module.exports = auth;
