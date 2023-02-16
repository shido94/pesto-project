const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const httpStatus = require('http-status');
const { constant } = require('../utils');
const { apiError } = require('../utils');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = ({
	payload,
	secret = constant.ACCESS_TOKEN_SECRET,
	options,
}) => {
	return jwt.sign(payload, secret, options);
};

/**
 * Verify token
 * @param {String} token
 * @returns {string}
 */
const verifyAccessToken = (token, secret = constant.ACCESS_TOKEN_SECRET) => {
	logger.info('verifyAccessToken');
	try {
		return jwt.verify(token, secret);
	} catch (error) {
		logger.error('verifyAccessToken error => ', error);
		throw new apiError(httpStatus.UNAUTHORIZED, 'Session has been expired');
	}
};

/**
 * Verify token
 * @param {String} token
 * @returns {string}
 */
const verifyRefreshToken = (token, secret = constant.REFRESH_TOKEN_SECRET) => {
	logger.info('verifyRefreshToken');
	try {
		return jwt.verify(token, secret);
	} catch (error) {
		logger.error('verifyRefreshToken error => ', error);
		throw new apiError(httpStatus.UNAUTHORIZED, 'Session has been expired');
	}
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (userId, role = 1) => {
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

/**
 * Generate signup token
 * @param {*} body
 * @returns
 */
const generatePayloadToken = async (payload) => {
	payload.exp = dayjs()
		.add(constant.TOKEN_EXPIRATION_MINUTES, 'minutes')
		.unix();
	const accessToken = generateToken({ payload });
	return accessToken;
};

module.exports = {
	generateToken,
	verifyAccessToken,
	verifyRefreshToken,
	generatePayloadToken,
	generateAuthTokens,
};
