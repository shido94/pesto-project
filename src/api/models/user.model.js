const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const userSchema = Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: Number,
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
    },
    tempMobile: {
      type: String,
    },
    profileUri: {
      type: String,
    },
    identityProofType: {
      type: Number,
      required: true,
    },
    identityProofNumber: {
      type: String,
      required: true,
    },
    identityProofImageUri: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      private: true, // used by the toJSON plugin
    },
    bankAccountNumber: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    customerId: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
    UPI: {
      type: String,
    },
    fundAccountId: {
      type: String,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reasonForReporting: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: String,
    },
    updateMobileOtp: {
      type: String,
    },
    updateMobileOtpExpiry: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.plugin(aggregatePaginate);

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function () {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

userSchema.pre('updateOne', async function (next) {
  const user = this;
  if (user._update.password) {
    user._update.password = await bcrypt.hash(user._update.password, 8);
  }
});

userSchema.virtual('fullAddress').get(function () {
  if (this.landmark) {
    return `${this.addressLine1} ${this.landmark} ${this.city} ${this.state} ${this.country} ${this.zipCode}`;
  } else {
    return `${this.addressLine1} ${this.city} ${this.state} ${this.country} ${this.zipCode}`;
  }
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
