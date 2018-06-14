// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const Bunyan = require('../nodule/bunyan');
const Configurate = require('../nodule/configurate');

module.exports = function(server) {

  /*
    CONFIG ROUTES
  */

  // LIST CONFIG
  server.get('/config', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('LIST '.green + 'all '.cyan + 'configuration '.yellow + 'request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell('Retrieving all configurations...'.gray);

    Config.apiQuery(req.params, function(err, docs){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      res.send(200, docs);

      Bunyan.succeed(String(docs.length).gray + ' configurations'.gray);

      next();

    });

  });

  // GET SINGLE CONFIG
  server.get('/config/:cid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('GET '.green + 'configuration '.yellow + req.params.cid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell('Checking if configuration exists...'.gray);

    Config.findOne({ cid: req.params.cid }, function(err, doc) {

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(!doc){

        res.send(404);

        Bunyan.conclude('FAILURE: '.red + 'Configuration does not exist'.gray);

        next();

      } else {

        Bunyan.tell('Configuration exists, sending response...'.gray);

        res.send(200, doc);

        Bunyan.succeed();

        next();

      }

    });

  });

  // UPDATE CONFIG
  server.put('/config/:cid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('UPDATE '.green + 'configuration '.yellow + req.params.cid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      Bunyan.fail("Submitted data is not JSON.".gray);
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    Config.findOneAndUpdate({ cid: req.params.cid }, { $set: data }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(!doc){

        res.send(404);

        Bunyan.fail('Configuration does not exist'.gray);

        next();

      } else {

        Bunyan.tell('Configuration exists, sending response...'.gray);

        res.send(200, doc);

        Bunyan.succeed();

        next();

      }

    });

  });

  // DELETE CONFIG
  server.del('/config/:cid', innerAuth.adminAuth, (req, res, next) => {

    Config.findOne({ cid: req.params.cid }, function(err, configtoremove){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(configtoremove){ // if it does exist

        Config.remove({ cid: req.params.cid }, function(err, doc) {

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(
              new errors.InvalidContentError(err)
            );
          }

          if(!doc){

            res.send(404);
            next();

          } else {

            console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + 'configuration '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

            res.send(204);
            next();

          }

        });

      } else {

        res.send(404);
        next();

      }

    });

  });

  /*
    RESET EVERYTHING
  */

  // DELETE MAIN CONFIG
  server.del('/admin/config/main', (req, res, next) => {

    Config.remove({}, function(err) {

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      Config.resetCount(function(err, nextCount){

        MainConf.remove({}, function(err) {

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(
              new errors.InvalidContentError(err)
            );
          }

          console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + 'EVERYTHING'.red + ' from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

          res.send(204);
          next();

        });

      });

    });

  });

};
