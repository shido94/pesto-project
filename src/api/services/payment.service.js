const axios = require('axios');
const httpService = require('./http.service');
const { constant, logger } = require('../utils');
const { CUSTOMER_TYPE, RAZOR_PAY_API, ACCOUNT_TYPE } = require('../utils/enum');

/**
 * Add Customer
 * @returns {Promise<CustomerData>}
 */
const addCustomer = async ({ name, email, mobile }) => {
  logger.info('inside addCustomer');
  try {
    const payload = {
      name,
      email,
      contact: mobile,
      type: CUSTOMER_TYPE.CUSTOMER,
    };

    return await httpService.post(constant.RAZOR_PAY.URI + '/' + RAZOR_PAY_API.ADD_CUSTOMER, payload);
  } catch (error) {
    logger.error(error);
    throw new Error('Please enter valid email or mobile');
  }
};

/**
 * Update Customer
 * @returns {Promise<UpdatedCustomerData>}
 */
const updateCustomer = async (id, { name, email, mobile }) => {
  logger.info('inside updateCustomer');
  try {
    const payload = {
      name,
      email,
      contact: mobile,
    };

    return await httpService.patch(constant.RAZOR_PAY.URI + '/' + RAZOR_PAY_API.ADD_CUSTOMER + '/' + id, payload);
  } catch (error) {
    logger.error(error);
    throw new Error('Please enter valid email or mobile');
  }
};

/**
 * Create FundAccount
 * @returns {Promise<FundAccount>}
 */
const addUserAccount = async (params) => {
  logger.info('inside addUserAccount');
  try {
    let payload = {};

    if (params.UPI) {
      payload = {
        contact_id: params.customerId,
        account_type: ACCOUNT_TYPE.VPA,
        vpa: {
          address: params.UPI,
        },
      };
    } else {
      payload = {
        contact_id: params.customerId,
        account_type: ACCOUNT_TYPE.BANK,
        bank_account: {
          name: params.accountHolderName,
          ifsc: params.ifscCode,
          account_number: params.bankAccountNumber,
        },
      };
    }

    return await httpService.post(constant.RAZOR_PAY.URI + '/' + RAZOR_PAY_API.FUND_ACCOUNTS, payload);
  } catch (error) {
    logger.error(error);
    throw new Error('Please enter valid banking details');
  }
};

module.exports = {
  addCustomer,
  updateCustomer,
  addUserAccount,
};
