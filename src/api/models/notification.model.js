const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { DeviceType, NotificationType } = require('../utils/enum');

const notificationSchema = Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiverIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: Number,
      enum: [NotificationType.BID, NotificationType.ORDER],
    },
    recipientType: {
      type: Number,
      enum: [DeviceType.WEB, DeviceType.ANDROID, DeviceType.IOS],
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    body: {
      type: Object,
      default: {},
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        private: true, // used by the toJSON plugin
      },
    ],
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);
notificationSchema.plugin(aggregatePaginate);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
