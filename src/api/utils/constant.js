const config = require('../config/environment');

module.exports = {
  PORT: config.PORT,
  API_URI: config.API_URI,
  DATABASE: config.DATABASE,
  ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: config.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION: '7d',
  REFRESH_TOKEN_EXPIRATION: '30d',
  TOKEN_EXPIRATION: 5 /** In minutes */,

  RAZOR_PAY: {
    USERNAME: config.RAZOR_PAY_USERNAME,
    PASSWORD: config.RAZOR_PAY_PASSWORD,
    URI: 'https://api.razorpay.com/v1',
  },

  FAKE_OTP: '1234',

  TWILIO: {
    ACCOUNT_SID: '',
    AUTH_TOKEN: '',
    MOBILE_NUMBER: '',
  },
  COLLECTIONS: {
    USER: 'User',
    CATEGORY: 'Category',
    PRODUCT: 'Product',
    BID_HISTORY: 'ProductBidHistory',
  },
};
