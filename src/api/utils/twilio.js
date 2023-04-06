const twilio = require('twilio');
const { constant } = require('../utils');

// const client = twilio(constant.TWILIO.ACCOUNT_SID, constant.TWILIO.AUTH_TOKEN);

/**
 * Send an email
 * @param {string} body
 * @param {string} from
 * @param {string} to
 * @returns {Promise}
 */
const sendOTP = async (body, to, from = constant.TWILIO.MOBILE_NUMBER) => {
  // const otpMsg = { from, to, body };
  // return client.messages.create(otpMsg);
};

module.exports = { sendOTP };
