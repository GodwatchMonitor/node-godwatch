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
      type: [Number],
    },
    recipients: {
      type: [Number],
    },
    clientversion: {
      type: Number,
      required: false
    },
    mailhost: { type: String },
    mailport: { type: Number },
    securemail: { type: Boolean },
    mailuser: { type: String },
    mailpass: { type: String },
    mailRejectUnauthorized: { type: Boolean }
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
