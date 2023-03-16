const axios = require('axios');
const { constant, logger } = require('../utils');
/**
 * Get Categories
 * @returns {Promise<Category>}
 */
const get = (url, params) => {
  const options = {
    method: 'get',
    url,
    params,
    auth: {
      username: constant.RAZOR_PAY.USERNAME,
      password: constant.RAZOR_PAY.PASSWORD,
    },
    headers: {
      'Content-type': 'application/json',
    },
  };

  logger.info(JSON.stringify(options));
  return new Promise((resolve, reject) => {
    axios(options)
      .then((data) => resolve(data.data))
      .catch((error) => reject(error));
  });
};

const post = (url, data) => {
  const options = {
    method: 'post',
    url,
    data,
    auth: {
      username: constant.RAZOR_PAY.USERNAME,
      password: constant.RAZOR_PAY.PASSWORD,
    },
    headers: {
      'Content-type': 'application/json',
    },
  };

  logger.info(JSON.stringify(options));
  return new Promise((resolve, reject) => {
    axios(options)
      .then((data) => resolve(data.data))
      .catch((error) => reject(error));
  });
};

const patch = (url, data) => {
  const options = {
    method: 'patch',
    url,
    data,
    auth: {
      username: constant.RAZOR_PAY.USERNAME,
      password: constant.RAZOR_PAY.PASSWORD,
    },
    headers: {
      'Content-type': 'application/json',
    },
  };

  logger.info(JSON.stringify(options));
  return new Promise((resolve, reject) => {
    axios(options)
      .then((data) => resolve(data.data))
      .catch((error) => reject(error));
  });
};

module.exports = {
  get,
  post,
  patch,
};
