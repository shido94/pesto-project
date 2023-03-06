const mongoose = require("mongoose");
const { Schema } = mongoose;
const { toJSON, paginate } = require("./plugins");

const productBidHistorySchema = Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    bidCreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    newValue: {
      type: Number,
    },
    notes: {
      type: String,
      default: "",
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
productBidHistorySchema.plugin(toJSON);
productBidHistorySchema.plugin(paginate);

/**
 * @typedef ProductBidHistory
 */
const ProductBidHistory = mongoose.model(
  "ProductBidHistory",
  productBidHistorySchema
);

module.exports = ProductBidHistory;
