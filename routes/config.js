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

function getConfig(callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    }

    Config.findOne({ cid: mc.currentconfig }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      callback(err, doc);

    });

  });

}

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

      console.log('[MM-DD-YY] hh:mm    '.timestamp + 'LIST '.green + 'all configuration'.yellow + ' request from ' + req.connection.remoteAddress.cyan + ' successful'.green);

      res.send(200, docs);
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

      if(!doc){

        res.send(404);
        next();

      } else {

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'configuration '.yellow + doc.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

        res.send(200, doc);
        next();

      }

    });

  });

  // UPDATE CONFIG
  server.put('/config/:cid', innerAuth.adminAuth, (req, res, next) => {

    if(!req.is('application/json')){
      console.error('[MM-DD-YY] hh:mm    '.timestamp + "Submitted data is not JSON.".red);
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    Config.findOneAndUpdate({ cid: req.params.cid }, { $set: data }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      if(!doc){

        res.send(404);
        next();

      } else {

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + 'configuration '.yellow + doc.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

        res.send(200, doc);
        next();

      }

    });

  });

  // DELETE CONFIG
  server.del('/config/:cid', innerAuth.adminAuth, (req, res, next) => {

    Config.findOne({ cid: req.params.cid }, function(err, configtoremove){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      if(configtoremove){ // if it does exist

        Config.remove({ cid: req.params.cid }, function(err, doc) {

          if(err){
            console.error(err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
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
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      Config.resetCount(function(err, nextCount){

        MainConf.remove({}, function(err) {

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
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
