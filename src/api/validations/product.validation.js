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

module.exports = {
  sellProduct,
};
