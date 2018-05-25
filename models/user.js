const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
USER SCHEMA
*/

const UserSchema = new mongoose.Schema(
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

UserSchema.plugin(timestamps);
UserSchema.plugin(mongooseStringQuery);
UserSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'userid',
  startAt: 100,
  incrementBy: 1
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
