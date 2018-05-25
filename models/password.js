const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
USER PASSWORD SCHEMA
*/

const UserPasswordSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    userid: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    }
  },
  { minimize: false }
);

UserPasswordSchema.plugin(timestamps);
UserPasswordSchema.plugin(mongooseStringQuery);

const UserPassword = mongoose.model('UserPassword', UserPasswordSchema);
module.exports = UserPassword;
