const User = (module.exports.User = require('./user.model'));
const Category = (module.exports.Category = require('./category.model'));
const Product = (module.exports.Product = require('./product.model'));
const ProductBidHistory = (module.exports.ProductBidHistory = require('./product.bid.history.model'));
const Payment = (module.exports.Payment = require('./payment.model'));
const Notification = (module.exports.Notification = require('./notification.model'));

const collections = {
  User,
  Category,
  Product,
  ProductBidHistory,
  Payment,
  Notification,
};

module.exports = collections;
