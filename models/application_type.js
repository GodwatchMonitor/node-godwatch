const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const ApplicationSchema = new mongoose.Schema(
  {
    app_id: {
      type: Number,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    }
  },
  { minimize: false }
);

ApplicationSchema.plugin(timestamps);
ApplicationSchema.plugin(mongooseStringQuery);

const Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;
