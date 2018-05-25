const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
CLIENT SCHEMA
*/

const ClientSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    userid: {
      type: Number,
      required: true,
    },
    usernameplain: {
      type: String,
      required: true,
    },
    dateJoined: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      required: true,
    }
  },
  { minimize: false }
);

ClientSchema.plugin(timestamps);
ClientSchema.plugin(mongooseStringQuery);
ClientSchema.plugin(autoIncrement.plugin, {
  model: 'Client',
  field: 'userid',
  startAt: 100,
  incrementBy: 1
});

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
