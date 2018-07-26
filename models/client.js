const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
CLIENT SCHEMA
*/

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cid: {
      type: Number,
      required: true,
    },
    datereported: {
      type: String,
      required: false,
    },
    interval: {
      type: Number,
      required: true,
    },
    ipaddr: {
      type: String,
      required: false,
    },
    tolerance: {
      type: Number,
      required: true,
    },
    timesmissing: {
      type: Number,
      required: false,
    },
    timesreported: {
      type: Number,
      required: false,
    },
    missing: {
      type: Boolean,
      required: true,
    },
    enabled: {
      type: Boolean,
      required: true,
    },
    version: {
      type: Number,
      required: false,
    },
    lastreportoffset: {
      type: Number,
      required: false,
    },
    averagereport: {
      type: Number,
      required: false,
    },
    fluctuation: {
      type: Number,
      required: false,
    },
    recipients: {
      type: [Number],
      required: false,
    },
    group: {
      type: String,
      required: false,
      default: 'default'
    },
    publicip: {
      type: String,
      required: false
    }
  },
  { minimize: false }
);

ClientSchema.plugin(timestamps);
ClientSchema.plugin(mongooseStringQuery);
ClientSchema.plugin(autoIncrement.plugin, {
  model: 'Client',
  field: 'cid',
  startAt: 100,
  incrementBy: 1
});

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
