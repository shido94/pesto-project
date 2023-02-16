const httpStatus = require('http-status');
const userService = require('./user.service');
const tokenService = require('./token.service');
const { responseMessage, constant, apiError } = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRep');

/**
 * Register user
 * @param {Object} body
 * @returns true/false
 */
const register = async (body) => {
	logger.debug('Inside checkUserWithEmailOrMobile');

	/** Check if user exists */
	if (await userService.getUserByEmailOrMobile(body.email, body.mobile)) {
		throw new apiError(
			httpStatus.CONFLICT,
			responseMessage.USER_ALREADY_EXIST
		);
	}

	try {
		return resourceRepo.create(constant.COLLECTIONS.USER, {
			data: body,
		});
	} catch (error) {
		console.log(error);
	}
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const login = async (email, password) => {
	logger.info('Inside login');
	const user = await userService.getUserByEmail(email);

	if (!user) {
		logger.error(responseMessage.INCORRECT_EMAIL);
		throw new apiError(
			httpStatus.UNAUTHORIZED,
			responseMessage.INCORRECT_EMAIL
		);
	}

	if (!(await user.isPasswordMatch(password))) {
		logger.error(responseMessage.INCORRECT_PASSWORD);
		throw new apiError(
			httpStatus.UNAUTHORIZED,
			responseMessage.INCORRECT_PASSWORD
		);
	}
	return user;
};

/**
 * Get user with email or mobile
 * @param {string} email
 * @param {string} mobile
 * @returns true/false
 */
const checkUserWithEmailOrMobile = async (email, mobile) => {
	logger.debug(
		'Inside checkUserWithEmailOrMobile, Email = ' +
			email +
			' and Mobile = ' +
			mobile
	);

	/** Check if user exists */
	if (await userService.getUserByEmailOrMobile(email, mobile)) {
		throw new apiError(
			httpStatus.CONFLICT,
			responseMessage.USER_ALREADY_EXIST
		);
	}

	logger.info('User not found inside checkUserWithEmailOrMobile ');
	return true;
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
	try {
		const refreshTokenDoc = await tokenService.verifyRefreshToken(
			refreshToken
		);

		logger.info('refreshTokenDoc ' + refreshTokenDoc);
		const user = await userService.getUserById(refreshTokenDoc.sub);
		if (!user) {
			throw new Error();
		}
		return tokenService.generateAuthTokens(user._id);
	} catch (error) {
		throw new apiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
	}
};

module.exports = {
	register,
	login,
	checkUserWithEmailOrMobile,
	refreshAuth,
};
