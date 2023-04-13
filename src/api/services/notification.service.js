const httpStatus = require('http-status');
const { Notification } = require('../models');
const { apiError, constant, eventEmitter } = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRepo');
const aggregationPaginate = require('../utils/aggregation-paginate');
const { ObjectId } = require('mongodb');
const { DeviceType, NotificationType, ProductBidStatus, OrderStatus, Events } = require('../utils/enum');
const userService = require('./user.service');

/**
 * Get Aggregation Pagination
 * @param {Object} aggregate - Mongo aggregate data
 * @param {Object} options - Query options
 * @returns {Promise<User>}
 */
const getNotificationAggregatedPagination = async (aggregate, options) => {
  return resourceRepo.aggregatePaginate(constant.COLLECTIONS.NOTIFICATION, {
    aggregate,
    options,
  });
};

/**
 * Create a notification
 * @param {Object} notificationData
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationData) => {
  return resourceRepo.create(constant.COLLECTIONS.NOTIFICATION, {
    data: notificationData,
  });
};

/**
 * Get a notification
 * @param {String} id
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id) => {
  const query = {
    _id: ObjectId(id),
  };
  return resourceRepo.findOne(constant.COLLECTIONS.NOTIFICATION, {
    query,
  });
};

/**
 * Aggregate Comp
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Comp>}
 */
const aggregateUserNotification = async (filter, options) => {
  const aggregateQuery = aggregateUserNotifications(filter);

  /**
   * Manage Pagination on  the aggregation query
   */
  const aggregate = await getNotificationAggregatedPagination(aggregateQuery, options);

  /**
   * After getting data from the mongoose pagination, we are modifying some fields
   */
  return aggregationPaginate(aggregate);
};

/**
 * Generate Aggregate Query
 * @param {Object} filter
 * @param {Object} userId
 * @returns {Promise<User>}
 */
const aggregateUserNotifications = (filter) => {
  const query = [];

  /**
   * Get Favorite Data
   */
  query.push({
    $match: {
      receiverIds: { $in: [ObjectId(filter.userId)] },
      deletedBy: { $nin: [ObjectId(filter.userId)] },
    },
  });

  query.push(senderLookupQuery());
  query.push({
    $unwind: {
      path: '$senderDetail',
      preserveNullAndEmptyArrays: true,
    },
  });

  query.push(productLookupQuery());
  query.push({
    $unwind: {
      path: '$productDetail',
      preserveNullAndEmptyArrays: true,
    },
  });

  query.push({ $sort: { createdAt: -1 } });

  const aggregate = Notification.aggregate(query);
  return aggregate;
};

/**
 * senderLookupQuery
 * @returns {Object}
 */
const senderLookupQuery = () => {
  return {
    $lookup: {
      from: 'users',
      let: { model_id: '$senderId' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$model_id'] },
          },
        },
        {
          $project: {
            email: 1,
            role: 1,
            name: 1,
            mobile: 1,
            profilePic: 1,
          },
        },
      ],
      as: 'senderDetail',
    },
  };
};

/**
 * compLookupQuery
 * @returns {Object}
 */
const productLookupQuery = () => {
  return {
    $lookup: {
      from: 'products',
      let: { model_id: '$productId' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$model_id'] },
          },
        },
      ],
      as: 'productDetail',
    },
  };
};

/**
 * Delete a notification
 * @param {String} id // Notification Id
 * @param {String} userId // UserId
 * @returns {Promise<Notification>}
 */
const removeUserFromNotificationReceiversArray = (id, userId) => {
  const query = {
    _id: id,
  };

  const data = {
    $push: { deletedBy: userId },
    $pull: { receiverIds: userId },
  };

  return resourceRepo.updateOne(constant.COLLECTIONS.NOTIFICATION, {
    query,
    data,
  });
};

/**
 * Delete all notification
 * @param {String} userId // UserId
 * @returns {Promise<Notification>}
 */
const removeUserFromAllReceiversArray = (userId) => {
  const query = {
    receiverIds: { $in: [userId] },
  };

  const data = {
    $push: { deletedBy: userId },
    $pull: { receiverIds: userId },
  };

  return resourceRepo.updateMany(constant.COLLECTIONS.NOTIFICATION, {
    query,
    data,
  });
};

/**
 * Delete notification
 * @param {String} userId
 * @param {String} notificationId
 * @returns {Promise<Notification>}
 */
const deleteNotification = async (userId, notificationId) => {
  try {
    logger.info('Deleting user notification');
    if (!notificationId) {
      await removeUserFromAllReceiversArray(ObjectId(userId));
    } else {
      await removeUserFromNotificationReceiversArray(ObjectId(notificationId), ObjectId(userId));
    }

    deleteNotificationFromDB();
  } catch (error) {
    logger.info('deleteNotification error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

const deleteNotificationFromDB = async () => {
  logger.info('Inside deleteNotificationFromDB');

  const query = {
    receiverIds: { $exists: true, $eq: [] },
  };

  return resourceRepo.remove(constant.COLLECTIONS.NOTIFICATION, {
    query,
  });
};

/**
 * Get unread notification count
 * @param {String} userId
 * @returns {Promise<Notification>}
 */
const unreadNotificationCount = (userId) => {
  const query = {
    receiverIds: { $in: [ObjectId(userId)] },
    readBy: { $nin: [ObjectId(userId)] },
  };

  return resourceRepo.countDocuments(constant.COLLECTIONS.NOTIFICATION, {
    query,
  });
};

/**
 * Read all  notification
 * @param {String} userId
 * @returns {Promise<Notification>}
 */
const readAllNotification = (userId) => {
  logger.info('Inside readAllNotification');
  userId = ObjectId(userId);

  const query = {
    receiverIds: { $in: [userId] },
    readBy: { $nin: [userId] },
  };

  const data = {
    $push: {
      readBy: userId,
    },
  };

  return resourceRepo.updateMany(constant.COLLECTIONS.NOTIFICATION, {
    query,
    data,
  });
};

eventEmitter.on('sendAddProductNotification', async (senderId, data) => {
  const sender = await userService.getUserById(ObjectId(senderId));
  const receiver = await userService.getUserByEmail('admin@admin.com');

  const notificationData = {
    senderId: senderId,
    receiverIds: [receiver._id],
    type: NotificationType.BID,
    title: constant.BID,
    description: `${sender.name} has created a new request`,
    recipientType: DeviceType.WEB,
    productId: data._id,
  };

  await createNotification(notificationData);
  logger.info('Add product Notification Saved');
});

eventEmitter.on(Events.ADD_NEW_BID, async (senderId, product) => {
  const sender = await userService.getUserById(ObjectId(senderId));

  const notificationData = {
    senderId: senderId,
    receiverIds: [product.createdBy],
    type: NotificationType.BID,
    title: constant.BID,
    description: `${sender.name} has accepted your request and offered you the price.`,
    recipientType: DeviceType.WEB,
    productId: product._id,
  };

  await createNotification(notificationData);
  logger.info('Updates bid Notification Saved');
});

eventEmitter.on('sendBidUpdatesNotification', async (senderId, bid, status) => {
  let description = '';
  const sender = await userService.getUserById(ObjectId(senderId));

  if (status === ProductBidStatus.MODIFIED) {
    description = `${sender.name} has offered the new price for the product.`;
  }
  if (status === ProductBidStatus.ACCEPTED) {
    description = `${sender.name} has accepted the price offered by you.`;
  }
  if (status === ProductBidStatus.REJECTED) {
    description = `${sender.name} has rejected the price offered by you.`;
  }

  const notificationData = {
    senderId: senderId,
    receiverIds: [bid.bidCreatedBy],
    type: NotificationType.BID,
    title: constant.BID,
    description: description,
    recipientType: DeviceType.WEB,
    productId: bid.productId,
  };

  await createNotification(notificationData);
  logger.info('Updates bid Notification Saved');
});

eventEmitter.on('orderUpdatesNotification', async (senderId, product, status) => {
  let description = '';
  const sender = await userService.getUserById(ObjectId(senderId));
  let title = constant.ORDER;

  if (status === OrderStatus.PICKED_UP_DATE_ESTIMATED) {
    description = `${sender.name} has updated the pick-up date.`;
  }
  if (status === OrderStatus.PICKED_UP) {
    description = `${sender.name} has picked your order.`;
  }
  if (status === OrderStatus.PAID) {
    description = `${sender.name} has initiated the payment, You'll receive in 3-5 business days`;
    title = constant.PAYMENT;
  }

  const notificationData = {
    senderId: senderId,
    receiverIds: [product.createdBy],
    type: NotificationType.BID,
    title: title,
    description: description,
    recipientType: DeviceType.WEB,
    productId: product._id,
  };

  await createNotification(notificationData);
  logger.info('Updates bid Notification Saved');
});

module.exports = {
  aggregateUserNotification,
  deleteNotification,
  unreadNotificationCount,
  readAllNotification,
  getNotificationById,
};
