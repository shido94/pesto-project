const Joi = require('joi');

const validateMobile = {
  body: Joi.object()
    .keys({
      mobile: Joi.string().trim().required().messages({
        'any.required': 'Mobile number is required',
      }),
    })
    .required(),
};

const signup = {
  body: Joi.object()
    .keys({
      name: Joi.string().trim().required().messages({
        'string.base': `Name must be string`,
      }),
      email: Joi.string().trim().email().messages({
        'string.base': `Email must be string`,
        'any.email': 'Email is not valid',
      }),
      mobile: Joi.string().trim().required().messages({
        'any.required': `Please enter mobile number`,
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
    .xor('bankAccountNumber', 'UPI'),
};

const verifyAuthOtp = {
  body: Joi.object()
    .keys({
      userId: Joi.string().trim().required().messages({
        'any.required': 'Id is missing',
      }),
      otp: Joi.string().trim().required().messages({
        'any.required': 'Otp is missing',
      }),
    })
    .required(),
};

module.exports = {
  signup,
  validateMobile,
  verifyAuthOtp,
};
