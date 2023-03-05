/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const aggregationPaginate = (aggregateData) => {
  const response = {
    results: [...aggregateData.docs],
    page: aggregateData.page,
    limit: aggregateData.limit,
    totalPages: aggregateData.totalPages,
    totalResults: aggregateData.totalDocs,
  };

  return response;
};

module.exports = aggregationPaginate;
