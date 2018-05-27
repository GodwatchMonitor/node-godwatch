// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const qs = require('qs');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const sysMail = require('../nodule/sys-mail');

module.exports = function(server) {


  /*
    CONFIG ROUTES
  */

  // LIST CONFIG
  server.get('/config', innerAuth.adminAuth, (req, res, next) => {
    Config.apiQuery(req.params, function(err, docs){
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(docs);
      next();
    });
  });

  // GET SINGLE CONFIG
  server.get('/config/:cid', innerAuth.adminAuth, (req, res, next) => {
    Config.findOne({ cid: req.params.cid }, function(err, doc) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(doc);
      next();
    });
  });

  // DELETE CONFIG
  server.del('/config/:cid', innerAuth.adminAuth, (req, res, next) => {
    Config.remove({ cid: req.params.cid }, function(err) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(204);
      next();
    });
  });


  /*
    ADMINISTRATIVE ROUTES
  */

  // RESET PASSWORD
  server.put('/admin/passkey/reset', innerAuth.adminAuth, (req, res, next) => {

    let data = {
      password: req.params.password,
      //currentconfig: 1
    }

    MainConf.findOneAndUpdate({ blip: 1 }, { $set: data }, function(err, doc) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(205);
      next();
    });
  });


  /*
    RECIPIENT ROUTES
  */

  // CREATE RECIPIENT
  server.post('/recipients', innerAuth.adminAuth, (req, res, next) => {

    if(!req.is('application/json')){
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    let recip = new Recipient(data);
    recip.save(function(err){
      if(err){
        console.error(err);
        return next(new errors.InternalError(err.message));
        next();
      }

      MainConf.findOne({ blip: 1 }, function(err, mc){
        if(err){
          console.error(err);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { recipients: recip.rid } }, function(err, doc){
          if(err){
            console.error(err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          res.send(201, recip);
          next();

        });

      });

    });

  });

  // GET SINGLE RECPIENT
  server.get('/recipients/:rid', innerAuth.adminAuth, (req, res, next) => {
    Recipient.findOne({ rid: req.params.rid }, function(err, doc){
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(doc);
      next();
    });
  });

  // LIST RECIPIENTS
  server.get('/recipients', innerAuth.adminAuth, (req, res, next) => {
    Recipient.apiQuery(req.params, function(err, docs){
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(docs);
      next();
    });
  });

  // UPDATE RECIPIENT

  // DELETE RECIPIENT

  // DELETE MAIN CONFIG
  server.del('/admin/config/main', (req, res, next) => {

    Config.remove({}, function(err) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      Config.resetCount(function(err, nextCount){

        MainConf.remove({}, function(err) {
          if(err){
            console.error(err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          res.send(204);
          next();
        });

      });

    });

  });

};
