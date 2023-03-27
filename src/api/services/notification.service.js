const httpStatus = require('http-status');
const { Notification } = require('../models');
const { apiError, constant } = require('../utils');
const resourceRepo = require('../dataRepositories/resourceRepo');
const aggregationPaginate = require('../utils/aggregation-paginate');
const { ObjectId } = require('mongodb');
const { DEVICE_TYPE, NOTIFICATION_TYPE, ProductBidStatus, OrderStatus } = require('../utils/enum');
const userService = require('./user.service');

/**
 * Get Aggregation Pagination
 * @param {Object} aggregate - Mongo aggregate data
 * @param {Object} options - Query options
 * @returns {Promise<User>}
 */
const getNotificationAggregatedPagination = async (aggregate, options) => {
  try {
    return resourceRepo.aggregatePaginate(constant.COLLECTIONS.NOTIFICATION, {
      aggregate,
      options,
    });
  } catch (error) {
    logger.info('getNotificationAggregatedPagination error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Create a notification
 * @param {Object} notificationData
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationData) => {
  try {
    return resourceRepo.create(constant.COLLECTIONS.NOTIFICATION, {
      data: notificationData,
    });
  } catch (error) {
    logger.info('createNotification error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Get a notification
 * @param {String} id
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id) => {
  try {
    const query = {
      _id: id,
    };
    return resourceRepo.findOne(constant.COLLECTIONS.NOTIFICATION, {
      query,
    });
  } catch (error) {
    logger.info('getNotificationById error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Save notifications
 * @param {string} senderId
 * @param {string} compId
 * @param {string} userIds
 * @returns {Promise}
 */
const saveNotifications = async (senderId, { compId, brokersId }) => {
  logger.info('Inside saveNotifications', JSON.stringify({ senderId, compId, brokersId }));

  const data = {
    senderId: senderId,
    receiverIds: brokersId,
    type: 1, // comp details
    compId: compId,
  };
  await createNotification(data);
};

/**
 * Aggregate Comp
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Comp>}
 */
const aggregateUserNotification = async (filter, options) => {
  try {
    const aggregateQuery = aggregateUserNotifications(filter);

    /**
     * Manage Pagination on  the aggregation query
     */
    const aggregate = await getNotificationAggregatedPagination(aggregateQuery, options);

    /**
     * After getting data from the mongoose pagination, we are modifying some fields
     */
    return aggregationPaginate(aggregate);
  } catch (error) {
    logger.info('aggregateNotification error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
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
  try {
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
  } catch (error) {
    logger.info('removeUserFromNotificationReceiversArray error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Delete all notification
 * @param {String} userId // UserId
 * @returns {Promise<Notification>}
 */
const removeUserFromAllReceiversArray = (userId) => {
  try {
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
  } catch (error) {
    logger.info('removeUserFromReceiversArray error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
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

  try {
    const query = {
      receiverIds: { $exists: true, $eq: [] },
    };

    return resourceRepo.remove(constant.COLLECTIONS.NOTIFICATION, {
      query,
    });
  } catch (error) {
    logger.info('deleteNotificationFromDB error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Get notification by compId
 * @param {String} compId
 * @param {String} userId
 * @returns {Promise<Notification>}
 */
const getNotificationByCompId = (compId, userId) => {
  logger.info('Get comp from notification');

  try {
    const query = {
      compId,
      type: 1,
      receiverIds: { $in: [userId] },
    };

    return resourceRepo.findOne(constant.COLLECTIONS.NOTIFICATION, {
      query,
    });
  } catch (error) {
    logger.info('getNotificationByCompId error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Get unread notification count
 * @param {String} userId
 * @returns {Promise<Notification>}
 */
const unreadNotificationCount = (userId) => {
  logger.info('Inside unreadNotificationCount');

  try {
    const query = {
      receiverIds: { $in: [ObjectId(userId)] },
      readBy: { $nin: [ObjectId(userId)] },
    };

    return resourceRepo.countDocuments(constant.COLLECTIONS.NOTIFICATION, {
      query,
    });
  } catch (error) {
    logger.info('unreadNotificationCount error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Read all  notification
 * @param {String} userId
 * @returns {Promise<Notification>}
 */
const readAllNotification = (userId) => {
  logger.info('Inside readAllNotification');
  userId = ObjectId(userId);

  try {
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
  } catch (error) {
    logger.info('readAllNotification error ', error);
    throw new apiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong, Please try again');
  }
};

/**
 * Save add product notification
 * @param {string} senderId
 * @param {Object} data
 * @returns {Promise}
 */
const sendAddProductNotification = async (senderId, data) => {
  const sender = await userService.getUserById(ObjectId(senderId));
  const receiver = await userService.getUserByEmail('admin@admin.com');

  const notificationData = {
    senderId: senderId,
    receiverIds: [receiver._id],
    type: NOTIFICATION_TYPE.BID,
    title: constant.BID,
    description: `${sender.name} has created a new request`,
    recipientType: DEVICE_TYPE.WEB,
    productId: data._id,
  };

  await createNotification(notificationData);
  logger.info('Add product Notification Saved');
};

/**
 * Save add product notification
 * @param {string} senderId
 * @param {Object} product
 * @returns {Promise}
 */
const sendBidCreateNotification = async (senderId, product) => {
  const sender = await userService.getUserById(ObjectId(senderId));

  const notificationData = {
    senderId: senderId,
    receiverIds: [product.createdBy],
    type: NOTIFICATION_TYPE.BID,
    title: constant.BID,
    description: `${sender.name} has accepted your request and offered you the price.`,
    recipientType: DEVICE_TYPE.WEB,
    productId: product._id,
  };

  await createNotification(notificationData);
  logger.info('Updates bid Notification Saved');
};

/**
 * Save add product notification
 * @param {string} senderId
 * @param {Object} bid
 * @param {Object} status
 * @returns {Promise}
 */
const sendBidUpdatesNotification = async (senderId, bid, status) => {
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
    type: NOTIFICATION_TYPE.BID,
    title: constant.BID,
    description: description,
    recipientType: DEVICE_TYPE.WEB,
    productId: bid.productId,
  };

  await createNotification(notificationData);
  logger.info('Updates bid Notification Saved');
};

/**
 * Save add product notification
 * @param {string} senderId
 * @param {Object} bid
 * @param {Object} status
 * @returns {Promise}
 */
const orderUpdatesNotification = async (senderId, product, status) => {
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
    description = `${sender.name} has rejected the price offered by you.`;
    title = constant.PAYMENT;
  }

  const notificationData = {
    senderId: senderId,
    receiverIds: [bid.bidCreatedBy],
    type: NOTIFICATION_TYPE.BID,
    title: title,
    description: description,
    recipientType: DEVICE_TYPE.WEB,
    productId: product._id,
  };

  await createNotification(notificationData);
  logger.info('Updates bid Notification Saved');
};

module.exports = {
  saveNotifications,
  getNotificationById,
  aggregateUserNotification,
  deleteNotification,
  getNotificationByCompId,
  unreadNotificationCount,
  readAllNotification,
  sendAddProductNotification,
  sendBidUpdatesNotification,
  orderUpdatesNotification,
  sendBidCreateNotification,
};
