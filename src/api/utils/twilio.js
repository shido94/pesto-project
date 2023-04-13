const twilio = require('twilio');
const constant = require('../utils/constant');

const client = twilio(constant.TWILIO.ACCOUNT_SID, constant.TWILIO.AUTH_TOKEN);

/**
 * Send an email
 * @param {string} body
 * @param {string} to
 * @returns {Promise}
 */
const sendOTP = async (body, to) => {
  const otpMsg = { from: constant.TWILIO.MOBILE_NUMBER, to, body };
  return client.messages.create(otpMsg);
};

module.exports = { sendOTP };
