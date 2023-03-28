const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Environment = process.env.NODE_ENV;

// Load env file
dotenv.config({});

module.exports = (function () {
  return {
    ENV: Environment,
    PORT: process.env.PORT || 3000,
    API_URI: process.env.API_URI,
    DATABASE: process.env.DATABASE || 'mongodb://127.0.0.1:27017/test',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    RAZOR_PAY_USERNAME: process.env.RAZOR_PAY_USERNAME,
    RAZOR_PAY_PASSWORD: process.env.RAZOR_PAY_PASSWORD,
    RAZOR_PAY_ACCOUNT: process.env.RAZOR_PAY_ACCOUNT,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  };
})();
