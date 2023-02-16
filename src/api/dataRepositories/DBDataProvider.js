const domain = require('../models');

class DbDataProvider {
	constructor() {}

	/**
	 * Find single data
	 */
	findOne(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.findOne(queryObject.query)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Find by id
	 */
	findById(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.findById(queryObject)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Find by query
	 */
	find(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.find(queryObject.query, queryObject.projection)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Get count
	 */
	countDocuments(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.countDocuments(queryObject.query)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Update One
	 */
	updateOne(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.updateOne(
					queryObject.query,
					queryObject.data,
					queryObject.options
				)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Update One
	 */
	updateMany(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.updateMany(
					queryObject.query,
					queryObject.data,
					queryObject.options
				)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Remove
	 */
	remove(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.remove(queryObject.query, queryObject.options)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Create New Data
	 */
	create(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.create(queryObject.data, queryObject.options)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Create Many Data
	 */
	createMany(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.insertMany(queryObject.data, queryObject.options)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	/**
	 * Create New Data
	 */
	aggregatePaginate(collectionName, queryObject) {
		return new Promise((resolve, reject) => {
			domain[collectionName]
				.aggregatePaginate(queryObject.aggregate, queryObject.options)
				.then((results) => {
					resolve(results);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}
}

module.exports = new DbDataProvider();
