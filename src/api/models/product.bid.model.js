const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const productChangeHistorySchema = Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    newValue: {
      type: Number,
    },
    notes: {
      type: String,
      default: '',
    },
    // actionStatus => 1-created, 2-rejected, 3-accepted, 4-counter
    bidStatus: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productChangeHistorySchema.plugin(toJSON);
productChangeHistorySchema.plugin(paginate);

/**
 * @typedef ProductChangeHistory
 */
const ProductChangeHistory = mongoose.model(
  'ProductChangeHistory',
  productChangeHistorySchema
);

module.exports = ProductChangeHistory;
