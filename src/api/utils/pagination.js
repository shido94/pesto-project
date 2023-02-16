/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const paginate = (filter, options) => {
	let sort = {};
	if (options.sortBy) {
		const sortingCriteria = {};
		options.sortBy.split(',').forEach((sortOption) => {
			const [key, order] = sortOption.split(':');
			sort[key] = order === 'desc' ? '-1' : '1';
		});
	} else {
		sort = { createdAt: 1 };
	}

	const limit =
		options.limit && parseInt(options.limit, 10) > 0
			? parseInt(options.limit, 10)
			: 10;
	const page =
		options.page && parseInt(options.page, 10) > 0
			? parseInt(options.page, 10)
			: 1;
	const skip = (page - 1) * limit;

	return { sort, limit, page, skip };
};

module.exports = paginate;
