const twilio = require('twilio');
const { constant, logger } = require('../utils');

const client = twilio(constant.TWILIO.ACCOUNT_SID, constant.TWILIO.AUTH_TOKEN);

/**
 * Send an email
 * @param {string} body
 * @param {string} from
 * @param {string} to
 * @returns {Promise}
 */
const sendOTP = async (body, to, from = constant.TWILIO.MOBILE_NUMBER) => {
  const otpMsg = { from, to, body };
  return client.messages.create(otpMsg);
};

/**
 * Send verification otp
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationOtp = async (to, otp) => {
  const body = `${otp} is the otp for the verification`;
  to = `+91${to}`;
  try {
    await sendOTP(body, to);
  } catch (error) {
    logger.log(error);
    throw new Error('Please enter a valid number');
  }
};

/**
 * Send forgotPassword otp
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const forgotPasswordOtp = async (to, otp) => {
  const body = `${otp} is the otp for the forgot password`;
  to = `+91${to}`;
  await sendOTP(body, to);
};

module.exports = {
  sendOTP,
  sendVerificationOtp,
  forgotPasswordOtp,
};
