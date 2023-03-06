const config = require("../config/environment");

module.exports = {
  PORT: config.PORT,
  API_URI: config.API_URI,
  DATABASE: config.DATABASE,
  ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: config.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION: "7d",
  REFRESH_TOKEN_EXPIRATION: "30d",
  TOKEN_EXPIRATION: 1 /** In minutes */,

  FAKE_OTP: "1234",

  TWILIO: {
    ACCOUNT_SID: "",
    AUTH_TOKEN: "",
    MOBILE_NUMBER: "",
  },
  COLLECTIONS: {
    USER: "User",
    CATEGORY: "Category",
    PRODUCT: "Product",
    BID_HISTORY: "ProductBidHistory",
  },
};
