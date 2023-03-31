const Joi = require('joi');

const cityWeatherQuery = {
  query: Joi.object().keys({
    city: Joi.string().required().messages({
      'string.base': `City should be a string`,
      'any.required': `Enter a valid cities name or code`,
    }),
    type: Joi.string().valid('code', 'name'),
    days: Joi.string(),
    limit: Joi.string(),
  }),
};

const blockUser = {
  body: Joi.object().keys({
    id: Joi.string().trim().required().messages({
      'any.required': `user id is required`,
    }),
    isReported: Joi.boolean().required(),
    reason: Joi.string().trim().required().messages({
      'any.required': `Reason is required`,
    }),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().trim().required().messages({
      'string.base': `Name must be string`,
    }),
    email: Joi.string().trim().email().messages({
      'string.base': `Email must be string`,
      'any.email': 'Email is not valid',
    }),
    identityProofType: Joi.number().required().valid(1, 2).messages({
      'any.required': `Identity proof type is required`,
    }),
    identityProofNumber: Joi.string().required().messages({
      'any.required': `Identity proof is required`,
    }),
    identityProofImageUri: Joi.string().trim().required().messages({
      'any.required': `Please upload identity proof image`,
    }),
    addressLine1: Joi.string().trim().required().messages({
      'any.required': `Address is missing`,
    }),
    landmark: Joi.string().trim(),
    city: Joi.string().trim().required().messages({
      'any.required': `City is missing`,
    }),
    state: Joi.string().required().messages({
      'any.required': `State is required`,
    }),
    zipCode: Joi.string().trim().required().messages({
      'any.required': `ZipCode is missing`,
    }),
    country: Joi.string().trim().required().messages({
      'any.required': `Country is missing`,
    }),
  }),
};

const updateMobile = {
  body: Joi.object().keys({
    mobile: Joi.string().trim().required().messages({
      'any.required': `Please enter mobile number`,
    }),
  }),
};

const updateFund = {
  body: Joi.object()
    .keys({
      bankAccountNumber: Joi.string().trim(),
      ifscCode: Joi.string().when('bankAccountNumber', {
        is: Joi.string().required(),
        then: Joi.string().required().messages({
          'any.required': `ifsc code is required`,
        }),
      }),
      accountHolderName: Joi.string().when('bankAccountNumber', {
        is: Joi.string().required(),
        then: Joi.string().required().messages({
          'any.required': 'Account holder name is required',
        }),
      }),
      UPI: Joi.string().trim(),
    })
    .oxor('bankAccountNumber', 'UPI'),
};

const verifyUserOtp = {
  body: Joi.object()
    .keys({
      otp: Joi.string().trim().required().messages({
        'any.required': 'Otp is missing',
      }),
    })
    .required(),
};

const updatePassword = {
  body: Joi.object()
    .keys({
      currentPassword: Joi.string().trim().required().messages({
        'any.required': 'Current password is required',
      }),
      newPassword: Joi.string().trim().required().messages({
        'any.required': 'New password is required',
      }),
    })
    .required(),
};

module.exports = {
  cityWeatherQuery,
  blockUser,
  updateProfile,
  updateMobile,
  updateFund,
  verifyUserOtp,
  updatePassword,
};
