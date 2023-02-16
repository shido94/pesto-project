const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const apiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
	const validSchema = pick(schema, ['params', 'query', 'body']);
	const object = pick(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({ errors: { label: 'key' }, abortEarly: false })
		.validate(object);

	if (error) {
		logger.error(error.details.map((details) => details.message));
		const errorMessage = error.details[0].message;
		return next(new apiError(httpStatus.BAD_REQUEST, errorMessage));
	}
	Object.assign(req, value);
	return next();
};

module.exports = validate;
