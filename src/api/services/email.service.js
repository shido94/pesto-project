const { sendEmail } = require('../utils');

/**
 * Send verification email
 * @param {Object} user
 * @param {string} otp
 * @returns {Promise}
 */
const sendForgotPasswordOtp = async (user, otp) => {
  try {
    // Add the url with the link to the email verification page of your front-end app
    const text = `Hi ${user.name}\n\nPlease use this code to reset your password: ${otp}\n\nThanks,\nSell-It`;
    const subject = 'Forgot Password';

    await sendEmail(user.email, subject, text);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendForgotPasswordOtp,
};
