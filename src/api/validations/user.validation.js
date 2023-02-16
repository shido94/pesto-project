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

module.exports = { cityWeatherQuery };
