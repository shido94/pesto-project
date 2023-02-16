const Joi = require('joi');

const login = {
	body: Joi.object()
		.keys({
			email: Joi.string().trim().email().messages({
				'string.base': `Email must be string`,
				'any.email': 'Email is not valid',
			}),
			password: Joi.string().required().messages({
				'any.required': `Password is required`,
			}),
		})
		.required(),
};

const signup = {
	body: Joi.object().keys({
		name: Joi.string().trim().email().messages({
			'string.base': `Name must be string`,
		}),
		email: Joi.string().trim().email().messages({
			'string.base': `Email must be string`,
			'any.email': 'Email is not valid',
		}),
		mobile: Joi.number().messages({
			'any.number': `Mobile should be integer`,
		}),
		password: Joi.string().required().messages({
			'any.required': `Password is required`,
		}),
	}),
};

module.exports = {
	signup,
	login,
};
