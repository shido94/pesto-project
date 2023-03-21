const resourceRepo = require('../dataRepositories/resourceRepo');
const { constant, logger } = require('../utils');

const manageHooks = async (body) => {
  logger.info('inside manageHooks');
  try {
    await addLogs(body);
  } catch (error) {
    logger.error('Webhooks error => ', error);
  }
};

const addLogs = async (body) => {
  const data = {
    type: body.event,
    data: body,
  };
  await resourceRepo.create(constant.COLLECTIONS.PAYMENT_LOGS, { data: data });
};

module.exports = {
  manageHooks,
};
