const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

/*
MAIN CONFIGURATION SCHEMA
*/

const MainConfSchema = new mongoose.Schema(
  {
    blip: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    }
  },
  { minimize: false }
);

MainConfSchema.plugin(timestamps);
MainConfSchema.plugin(mongooseStringQuery);

const MainConf = mongoose.model('UserPassword', MainConfSchema);
module.exports = MainConf;
