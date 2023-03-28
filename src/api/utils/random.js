const crypto = require('crypto');

module.exports.randomToken = function () {
  return Math.random().toString(36).slice(-20);
};
