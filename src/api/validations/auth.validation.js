const Joi = require('joi');

const login = {
  body: Joi.object()
    .keys({
      mobile: Joi.string().trim().messages({
        'any.required': 'Mobile number is required',
      }),
      email: Joi.string().email().messages({
        'any.required': 'Email is required',
      }),
      password: Joi.string().trim().required().messages({
        'any.required': `Password is required`,
      }),
    })
    .xor('email', 'mobile')
    .required(),
};

const signup = {
  body: Joi.object()
    .keys({
      name: Joi.string().trim().required().messages({
        'string.base': `Name must be string`,
      }),
      email: Joi.string().trim().email().required().messages({
        'string.base': `Email must be string`,
        'any.email': 'Email is not valid',
      }),
      password: Joi.string().trim().required().min(6).messages({
        'any.required': `Password is required`,
      }),
      mobile: Joi.string().trim().required().messages({
        'any.required': `Please enter mobile number`,
      }),
      identityProofType: Joi.number().required().valid(1, 2).messages({
        'any.required': `Identity proof type is required`,
      }),
      identityProofNumber: Joi.string().required().messages({
        'any.required': `Identity proof number is required`,
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
    .oxor('bankAccountNumber', 'UPI'),
};

const resetPassword = {
  body: Joi.object()
    .keys({
      userId: Joi.string().trim().required().messages({
        'any.required': 'Id is missing',
      }),
      otp: Joi.string().trim().required().messages({
        'any.required': 'Otp is missing',
      }),
      password: Joi.string().trim().required().min(6).messages({
        'any.required': `Password is required`,
      }),
    })
    .required(),
};

const forgotPassword = {
  body: Joi.object()
    .keys({
      mobile: Joi.string().trim().messages({
        'any.required': 'Please enter a valid mobile number',
      }),
      email: Joi.string().email().messages({
        'any.required': 'Please enter a valid email',
      }),
    })
    .xor('email', 'mobile'),
};

const resendResetOtp = {
  body: Joi.object()
    .keys({
      userId: Joi.string().trim().required().messages({
        'any.required': 'Id is missing',
      }),
    })
    .required(),
};

const refreshToken = {
  body: Joi.object()
    .keys({
      token: Joi.string().trim().required().messages({
        'any.required': 'Refresh token is missing',
      }),
    })
    .required(),
};

module.exports = {
  signup,
  login,
  resetPassword,
  resendResetOtp,
  forgotPassword,
  refreshToken,
};
