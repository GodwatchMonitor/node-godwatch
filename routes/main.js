// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const qs = require('qs');
const fs = require('fs');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');
const Client = require('../models/client');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const sysMail = require('../nodule/sys-mail');
const Reporting = require('../nodule/reporting');
const Bunyan = require('../nodule/bunyan');
const Configurate = require('../nodule/configurate');

module.exports = function(server) {

  /*
    ADMINISTRATIVE ROUTES
  */

  /*// RESET PASSWORD
  server.put('/admin/passkey/reset', innerAuth.adminAuth, (req, res, next) => {

    let data = {
      password: req.params.password,
      //currentconfig: 1
    }

    MainConf.findOneAndUpdate({ blip: 1 }, { $set: data }, function(err, doc) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      res.send(205);
      next();
    });
  });*/

};
