/**
 * @name: responseHandler
 * @description: This module is used to send the response for any action back to the client.
 * @param {object} request
 * @param {object} data this is data that can be send to back to the client with the response.
 * @returns {object} res.status() function. Which is used to send the response to the client side.
 */
exports.sendSuccess = function (res, status, message, data = []) {
	return res.status(status).json({
		type: 'success',
		message: message ? message : 'OK',
		response: data,
	});
};

exports.checkNextHit = function (data, limit) {
	let finalResult = {};
	let extendedLimit = limit + 1;
	if (extendedLimit == data.length) {
		data.pop(data.length);
		finalResult = {
			result: data,
			nextHit: true,
		};
	} else {
		finalResult = {
			result: data,
			nextHit: false,
		};
	}
	return finalResult;
};
