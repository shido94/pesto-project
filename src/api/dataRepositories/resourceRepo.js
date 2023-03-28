const dbRepo = require('./DBDataProvider');

class ResourceRepo {
  constructor() {}

  findOne(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .findOne(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  find(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .find(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  countDocuments(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .countDocuments(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  create(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .create(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  updateOne(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .updateOne(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  updateMany(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .updateMany(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  remove(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .remove(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  aggregatePaginate(collection, queryObject) {
    return new Promise((resolve, reject) => {
      dbRepo
        .aggregatePaginate(collection, queryObject)
        .then(function (data) {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = new ResourceRepo();
