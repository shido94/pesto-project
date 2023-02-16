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
			lowercase: true,
		},
		mobile: {
			type: Number,
		},
		password: {
			type: String,
			trim: true,
			private: true, // used by the toJSON plugin
		},
	},
	{
		timestamps: true,
	}
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

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
