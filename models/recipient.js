const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
RECPIENT SCHEMA
*/

const RecipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: Number,
      required: true,
    },
    rid: {
      type: Number,
      required: true,
    }
  },
  { minimize: false }
);

RecipientSchema.plugin(timestamps);
RecipientSchema.plugin(mongooseStringQuery);
RecipientSchema.plugin(autoIncrement.plugin, {
  model: 'Recipient',
  field: 'rid',
  startAt: 100,
  incrementBy: 1
});

const Recipient = mongoose.model('Recipient', RecipientSchema);
module.exports = Recipient;
