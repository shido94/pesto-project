const apiError = require('./apiError');
const catchAsync = require('./catchAsync');
const constant = require('./constant');
const logger = require('./logger');
const pick = require('./pick');
const responseMessage = require('./response.message');
const swagger = require('./swagger');
const { randomNumberGenerator, setTimeFactory } = require('./generator');
const {
  CategoryEnum,
  NotificationRecipientTypeEnum,
  NotificationTypeEnum,
  ProductBidStatus,
  OrderStatus,
  UserRole,
  ExpiryUnit,
  SocketEvents,
  Events,
} = require('./enum');
const aggregationPaginate = require('./aggregation-paginate');
const s3 = require('./s3');
const multer = require('./multer');
const eventEmitter = require('./event');
const { generateToken, verifyToken } = require('./jsonwebtoken');
const { sendEmail } = require('./nodemailer');
const { sendOTP } = require('./twilio');

module.exports = {
  apiError,
  catchAsync,
  constant,
  logger,
  pick,
  responseMessage,
  swagger,
  CategoryEnum,
  NotificationRecipientTypeEnum,
  NotificationTypeEnum,
  ProductBidStatus,
  OrderStatus,
  UserRole,
  randomNumberGenerator,
  setTimeFactory,
  ExpiryUnit,
  aggregationPaginate,
  s3,
  multer,
  eventEmitter,
  generateToken,
  verifyToken,
  sendEmail,
  sendOTP,
  SocketEvents,
  Events,
};
