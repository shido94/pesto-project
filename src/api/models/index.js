const User = (module.exports.User = require('./user.model'));
const Category = (module.exports.Category = require('./category.model'));

const collections = {
  User,
  Category,
};

module.exports = collections;
