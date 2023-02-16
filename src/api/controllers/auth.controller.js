const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { responseMessage } = require('../utils');
const { authService } = require('../services');
const { responseHandler } = require('../handlers');
const { tokenService } = require('../services');

const register = catchAsync(async (req, res) => {
	/** Add user to DB */
	const user = await authService.register(req.body);
	logger.info('User created');

	/** Generate token */
	const tokens = await tokenService.generateAuthTokens(user._id);

	return responseHandler.sendSuccess(
		res,
		httpStatus.OK,
		responseMessage.SUCCESS,
		{ tokens, user }
	);
});

const login = catchAsync(async (req, res) => {
	const { email, password } = req.body;

	const user = await authService.login(email, password);

	logger.info('User found');

	const tokens = await tokenService.generateAuthTokens(user._id);
	logger.info('Token Generated');

	logger.info('User has logged-in successfully');

	return responseHandler.sendSuccess(
		res,
		httpStatus.OK,
		{ user, tokens },
		'You have logged-in successfully'
	);
});

module.exports = {
	login,
	register,
};
