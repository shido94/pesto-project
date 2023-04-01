const Joi = require('joi');

const sellProduct = {
  body: Joi.object().keys({
    categoryId: Joi.string().trim().required().messages({
      'any.required': `categoryId is required`,
    }),
    type: Joi.string().trim().required().messages({
      'any.required': 'Type  is required',
    }),
    title: Joi.string().trim().required().messages({
      'any.required': `Title  is required`,
    }),
    description: Joi.string().required().messages({
      'any.required': `Description is required`,
    }),
    brand: Joi.string().trim(),
    purchasedYear: Joi.string().trim(),
    distanceDriven: Joi.string().trim(),
    pickupAddress: Joi.string().trim().required().messages({
      'any.required': `Address is missing`,
    }),
    images: Joi.array()
      .items({
        uri: Joi.string().required(),
        isDefault: Joi.boolean().required(),
      })
      .required()
      .messages({
        'any.required': `Image data is required`,
      }),
  }),
};

const updateProduct = {
  body: Joi.object().keys({
    categoryId: Joi.string().trim().required().messages({
      'any.required': `categoryId is required`,
    }),
    productId: Joi.string().trim().required().messages({
      'any.required': `productId is required`,
    }),
    type: Joi.string().trim().required().messages({
      'any.required': 'Type  is required',
    }),
    title: Joi.string().trim().required().messages({
      'any.required': `Title  is required`,
    }),
    description: Joi.string().required().messages({
      'any.required': `Description is required`,
    }),
    brand: Joi.string().trim(),
    purchasedYear: Joi.string().trim(),
    distanceDriven: Joi.string().trim(),
    pickupAddress: Joi.string().trim().required().messages({
      'any.required': `Address is missing`,
    }),
    images: Joi.array()
      .items({
        uri: Joi.string().required(),
        isDefault: Joi.boolean().required(),
      })
      .required()
      .messages({
        'any.required': `Image data is required`,
      }),
  }),
};

const createNewBid = {
  body: Joi.object().keys({
    productId: Joi.string().trim().required().messages({
      'any.required': `productId is required`,
    }),
    offeredAmount: Joi.number().required().messages({
      'any.required': `Offered amount is required`,
    }),
  }),
};

const updateBid = {
  body: Joi.object().keys({
    bidId: Joi.string().trim().required().messages({
      'any.required': `bidId is required`,
    }),
    status: Joi.number().required().messages({
      'any.required': `Status is required`,
    }),
    notes: Joi.string().trim(),
    offeredAmount: Joi.number().when('status', {
      is: 4,
      then: Joi.required(),
    }),
  }),
};

const addPickedUpDate = {
  body: Joi.object().keys({
    productId: Joi.string().trim().required().messages({
      'any.required': `productId is required`,
    }),
    estimatedPickedUpDate: Joi.string().required().messages({
      'any.required': `Pick up date is required`,
    }),
  }),
};

const validateProduct = {
  body: Joi.object().keys({
    productId: Joi.string().trim().required().messages({
      'any.required': `productId is required`,
    }),
  }),
};

const payout = {
  body: Joi.object().keys({
    productId: Joi.string().trim().required().messages({
      'any.required': `productId is required`,
    }),
    userId: Joi.string().trim().required().messages({
      'any.required': `userId is required`,
    }),
  }),
};

const addCategory = {
  body: Joi.object().keys({
    name: Joi.string().trim().required().messages({
      'any.required': `Name is required`,
    }),
    isActive: Joi.boolean().required().messages({
      'any.required': `Active status is required`,
    }),
    parentId: Joi.string(),
    logo: Joi.string(),
  }),
};

const deleteCategory = {
  body: Joi.object().keys({
    categoryId: Joi.string().trim().required().messages({
      'any.required': `Category id is required`,
    }),
  }),
};

module.exports = {
  sellProduct,
  updateProduct,
  createNewBid,
  updateBid,
  addPickedUpDate,
  validateProduct,
  payout,
  addCategory,
  deleteCategory,
};
