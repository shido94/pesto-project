const { constant } = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRep');

/**
 * Get user email
 * @returns {Promise<Category>}
 */
const getCategories = async () => {
  return resourceRepo.find(constant.COLLECTIONS.CATEGORY, {});
};

module.exports = {
  getCategories,
};
