const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const Client = require('../models/client');
const Recipient = require('../models/recipient');

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
    clients: {
      type: [Client.ObjectId],
    },
    recipients: {
      type: [Recipient.ObjectId],
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
