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
    hash: {
      type: String,
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
