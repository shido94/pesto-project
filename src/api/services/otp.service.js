const { sendOTP } = require('../utils');

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
