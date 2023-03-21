const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const logsSchema = Schema(
  {
    type: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
logsSchema.plugin(toJSON);
logsSchema.plugin(paginate);
logsSchema.plugin(aggregatePaginate);

/**
 * @typedef Logs
 */
const Logs = mongoose.model('Logs', logsSchema);

module.exports = Logs;
