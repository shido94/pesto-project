const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const constant = require('../utils/constant');

const transport = nodemailer.createTransport({
  host: constant.MAIL.HOST,
  port: constant.MAIL.PORT,
  ignoreTLS: false,
  secure: true,
  service: constant.MAIL.SERVICE,
  auth: {
    user: constant.MAIL.SMTP_USER,
    pass: constant.MAIL.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/* istanbul ignore next */
if (constant.ENV !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((error) =>
      logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env', error),
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  try {
    logger.info('Control in send text email');
    const msg = { from: constant.MAIL.SMTP_EMAIL, to, subject, text };
    await transport.sendMail(msg);
  } catch (error) {
    logger.error('Error in sendEmail ==> ', error);
    throw new Error('Email has not been sent');
  }
};

module.exports = { sendEmail };
