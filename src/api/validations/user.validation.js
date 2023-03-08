const Joi = require('joi');

const cityWeatherQuery = {
  query: Joi.object().keys({
    city: Joi.string().required().messages({
      'string.base': `City should be a string`,
      'any.required': `Enter a valid cities name or code`,
    }),
    type: Joi.string().valid('code', 'name'),
    days: Joi.string(),
    limit: Joi.string(),
  }),
};

const blockUser = {
  body: Joi.object().keys({
    id: Joi.string().trim().required().messages({
      'any.required': `user id is required`,
    }),
    isReported: Joi.boolean().required(),
    reason: Joi.string().trim().required().messages({
      'any.required': `Reason is required`,
    }),
  }),
};

module.exports = { cityWeatherQuery, blockUser };
