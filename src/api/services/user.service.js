const { constant } = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRep');

/**
 * Get user by mobile or email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmailOrMobile = async (email, mobile) => {
	const queryData = [];
	if (mobile) {
		queryData.push({ mobile });
	}
	if (email) {
		queryData.push({ email });
	}
	const query = {
		$or: queryData,
	};

	return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

/**
 * Get user email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
	const query = {
		email,
	};

	return resourceRepo.findOne(constant.COLLECTIONS.USER, { query });
};

module.exports = {
	getUserByEmailOrMobile,
	getUserByEmail,
};
