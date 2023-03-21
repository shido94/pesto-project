const axios = require('axios');
const httpService = require('./http.service');
const { constant, logger } = require('../utils');
const { CUSTOMER_TYPE, RAZOR_PAY_API, ACCOUNT_TYPE } = require('../utils/enum');
const resourceRepo = require('../dataRepositories/resourceRepo');

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
const addUserFundAccount = async (params) => {
  logger.info('inside addUserFundAccount');
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

const createPayment = async (paidBy, product) => {
  logger.info('Inside createPayment');
  /** Create Payout */
  const payout = await payoutToUser(product.createdByDetails, product);
  logger.info('Payout is done');

  console.log(payout);

  const data = {
    paidBy: paidBy,
    paidTo: product.createdBy,
    productId: product._id,
    payoutId: payout.id,
    amount: payout.amount / 100, // Convert paisa in rupees
    status: payout.status,
  };

  /** update otp data */
  return resourceRepo.create(constant.COLLECTIONS.PAYMENT, {
    data: data,
  });
};

/**
 * Make a payout
 * @returns {Promise<Payout>}
 */
const payoutToUser = async (user, product) => {
  logger.info('inside payoutToUser');
  try {
    const payload = {
      account_number: constant.RAZOR_PAY.ACCOUNT,
      fund_account_id: user.fundAccountId,
      amount: product.acceptedAmount,
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: `Product Id => ${product._id.toString()}`,
      narration: 'Paying for user product',
      notes: {
        userId: user._id.toString(),
        productId: product._id.toString(),
      },
    };

    return await httpService.post(constant.RAZOR_PAY.URI + '/' + RAZOR_PAY_API.PAYOUT, payload);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

module.exports = {
  addCustomer,
  updateCustomer,
  addUserFundAccount,
  createPayment,
};
