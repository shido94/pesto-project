const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Environment = process.env.NODE_ENV;

// Load env file
if (fs.existsSync(path.join(process.cwd(), `/.env.${Environment}`))) {
  dotenv.config({
    path: `.env.${Environment}`,
  });
} else {
  process.exit(1);
}

module.exports = (function () {
  return {
    PORT: process.env.PORT || 3000,
    API_URI: process.env.API_URI,
    DATABASE: process.env.DATABASE || 'mongodb://127.0.0.1:27017/test',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  };
})();
