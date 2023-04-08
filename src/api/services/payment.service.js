const axios = require('axios');
const httpService = require('./http.service');
const { constant, logger } = require('../utils');
const { CustomerType, RazorPayApi, AccountType, PaymentStatus } = require('../utils/enum');
const resourceRepo = require('../dataRepositories/resourceRepo');
const { Payment } = require('../models');
const { ObjectId } = require('mongodb');

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
      type: CustomerType.CUSTOMER,
    };

    return await httpService.post(constant.RAZOR_PAY.URI + '/' + RazorPayApi.ADD_CUSTOMER, payload);
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

    return await httpService.patch(constant.RAZOR_PAY.URI + '/' + RazorPayApi.ADD_CUSTOMER + '/' + id, payload);
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
        account_type: AccountType.VPA,
        vpa: {
          address: params.UPI,
        },
      };
    } else {
      payload = {
        contact_id: params.customerId,
        account_type: AccountType.BANK,
        bank_account: {
          name: params.accountHolderName,
          ifsc: params.ifscCode,
          account_number: params.bankAccountNumber,
        },
      };
    }

    return await httpService.post(constant.RAZOR_PAY.URI + '/' + RazorPayApi.FUND_ACCOUNTS, payload);
  } catch (error) {
    logger.error(error);
    throw new Error('Please enter valid banking details');
  }
};

const createPayment = async (paidBy, product) => {
  logger.info('Inside createPayment');

  try {
    /** Create Payout */
    const payout = await payoutToUser(product.createdByDetails, product);
    logger.info('Payout is done');

    const data = {
      paidBy: paidBy,
      paidTo: product.createdBy,
      productId: product._id,
      payoutId: payout.id,
      amount: payout.amount / 100, // Convert paisa in rupees
      status: PaymentStatus.PROCESSED,
    };

    /** update otp data */
    return resourceRepo.create(constant.COLLECTIONS.PAYMENT, {
      data: data,
    });
  } catch (error) {
    throw new Error('Something went wrong');
  }
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
      amount: product.acceptedAmount * 100,
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      queue_if_low_balance: false,
      reference_id: `Product Id => ${product._id.toString()}`,
      narration: 'Paying for user product',
      notes: {
        userId: user._id.toString(),
        productId: product._id.toString(),
      },
    };

    return await httpService.post(constant.RAZOR_PAY.URI + '/' + RazorPayApi.PAYOUT, payload);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getTotalUserEarning = async (userId) => {
  logger.info('Inside getTotalUserEarning');

  const payments = await Payment.aggregate([
    {
      $match: {
        paidTo: ObjectId(userId),
        status: PaymentStatus.PROCESSED,
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: '$amount',
        },
      },
    },
  ]);

  return payments.length ? payments[0].total : 0;
};

module.exports = {
  addCustomer,
  updateCustomer,
  addUserFundAccount,
  createPayment,
  getTotalUserEarning,
};
