const httpStatus = require('http-status');
const { constant } = require('../config');
const { apiError } = require('../utils');

const errorConverter = (err, req, res, next) => {
	let error = err;
	if (!(error instanceof apiError)) {
		const statusCode = error.statusCode
			? httpStatus.BAD_REQUEST
			: httpStatus.INTERNAL_SERVER_ERROR;
		const message = error.message || httpStatus[statusCode];
		error = new apiError(statusCode, message, false, err.stack);
	}
	next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
	let { statusCode, message } = err;
	if (process.env === 'production' && !err.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	}

	res.locals.errorMessage = err.message;
	logger.error(err);

	const response = {
		code: statusCode,
		message,
		...(process.env === 'development' && { stack: err.stack }),
	};

	if (process.env === 'development') {
	}

	res.status(statusCode).send(response);
};

module.exports = {
	errorConverter,
	errorHandler,
};
