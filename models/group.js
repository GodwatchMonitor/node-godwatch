const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
GROUP SCHEMA
*/

const GroupSchema = new mongoose.Schema(
  {
    gid: {
      type: Number,
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
    recipients: {
      type: [Number],
      required: false,
    },
    name: {
      type: String,
      required: false
    }
  },
  { minimize: false }
);

GroupSchema.plugin(timestamps);
GroupSchema.plugin(mongooseStringQuery);
GroupSchema.plugin(autoIncrement.plugin, {
  model: 'Group',
  field: 'gid',
  startAt: 100,
  incrementBy: 1
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;
