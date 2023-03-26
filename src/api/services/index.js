const userService = require('./user.service');
const authService = require('./auth.service');
const tokenService = require('./token.service');
const productService = require('./product.service');
const adminService = require('./admin.service');
const httpService = require('./http.service');
const paymentService = require('./payment.service');
const notificationService = require('./notification.service');

module.exports = {
  userService,
  authService,
  tokenService,
  productService,
  adminService,
  httpService,
  paymentService,
  notificationService,
};
