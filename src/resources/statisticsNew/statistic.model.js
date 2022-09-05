const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { addMethods } = require('../../utils/toResponse');

const StatisticsNewSchema = new Schema(
  {
    userId: {
      type: String,
      required: true
    },
    date: {
      type: String
    },
    value: {
      type: Number
    },
    totalValue: {
      type: Number
    },
    source: {
      type: String
    },
    field: {
      type: String
    }
  },
  { collection: 'statisticNew' }
);

addMethods(StatisticsNewSchema);

module.exports = mongoose.model('StatisticsNew', StatisticsNewSchema);
