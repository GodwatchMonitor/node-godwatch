const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
CONFIG SCHEMA
*/

const ConfigSchema = new mongoose.Schema(
  {
    cid: {
      type: Number,
      required: true,
    },
    reporting: {
      type: Boolean,
      required: true,
    },
    reportingaddr: {
      type: String,
      required: false,
    },
    adminuser: {
      type: String,
      required: true,
    },
    adminpass: {
      type: String,
      required: true,
    }
  },
  { minimize: false }
);

ConfigSchema.plugin(timestamps);
ConfigSchema.plugin(mongooseStringQuery);
ConfigSchema.plugin(autoIncrement.plugin, {
  model: 'Config',
  field: 'cid',
  startAt: 0,
  incrementBy: 1
});

const Config = mongoose.model('Config', ConfigSchema);
module.exports = Config;
