// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const qs = require('qs');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');
const Client = require('../models/client');

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

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'recipient'.yellow + ' request from ' + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    let recip = new Recipient(data);
    recip.save(function(err){
      if(err){
        console.error("ERROR".red, err);
        return next(new errors.InternalError(err.message));
        next();
      }

      MainConf.findOne({ blip: 1 }, function(err, mc){
        if(err){
          console.error("ERROR".red, err);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { recipients: recip.rid } }, function(err, doc){

          if(err){
            console.error("ERROR".red, err);
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

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + ('recipient ' + req.params.rid).yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Recipient.findOne({ rid: req.params.rid }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(200, doc);
      next();

    });

  });

  // LIST RECIPIENTS
  server.get('/recipients', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + ('all recipients').yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Recipient.apiQuery(req.params, function(err, docs){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(200, docs);
      next();

    });

  });

  // UPDATE RECIPIENT
  server.put('/recipients/:rid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + ('recipient ' + req.params.rid).yellow + ' request from ' + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      console.error('[MM-DD-YY] hh:mm    '.timestamp + "Submitted data is not JSON.".red);
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    Recipient.findOneAndUpdate({ rid: req.params.rid }, { $set: data }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      } else if (!doc){
        return next(
          new errors.ResourceNotFoundError(
            'The resource you requested could not be found.'
          )
        );
      }

      console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + ('recipient ' + req.params.rid).yellow + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

      res.send(200, doc);
      next();

    });

  });

  // DELETE RECIPIENT
  server.del('/recipients/:rid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + ('recipient ' + req.params.rid).yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Recipient.remove({ rid: req.params.rid }, function(err, docs){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      MainConf.findOne({ blip: 1 }, function(err, mc){
        if(err){
          console.error("ERROR".red, err);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        Config.findOneAndUpdate({ cid: mc.currentconfig }, { $pull: { recipients: req.params.rid } }, function(err, doc){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + ('recipient ' + req.params.rid).yellow + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

          res.send(204);
          next();

        });

      });

    });

  });


  /*
    CLIENT ROUTES
  */

  // CREATE CLIENT
  server.post('/clients', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    let cli = new Client(data);
    cli.datereported = "None";

    cli.hash = (function() {
      let ns = "";
      for(var i=0; i < cli.name.length; i++){
        ns += String.fromCharCode(cli.name.charCodeAt(i)*(i+1));
      }
      return ns;
    })();

    cli.save(function(err){
      if(err){
        console.error("ERROR".red, err);
        return next(new errors.InternalError(err.message));
        next();
      }

      MainConf.findOne({ blip: 1 }, function(err, mc){
        if(err){
          console.error("ERROR".red, err);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { clients: cli.cid } }, function(err, doc){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          res.send(201, cli);
          next();

        });

      });

    });

  });

  // GET SINGLE CLIENT
  server.get('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + ('client ' + req.params.cid).yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Client.findOne({ cid: req.params.cid }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(200, doc);
      next();

    });

  });

  // LIST CLIENTS
  server.get('/clients', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + ('all clients').yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Client.apiQuery(req.params, function(err, docs){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(200, docs);
      next();

    });

  });

  // UPDATE CLIENT
  server.put('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + ('client ' + req.params.cid).yellow + ' request from ' + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      console.error('[MM-DD-YY] hh:mm    '.timestamp + "Submitted data is not JSON.".red);
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    Client.findOneAndUpdate({ cid: req.params.cid }, { $set: data }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      } else if (!doc){
        return next(
          new errors.ResourceNotFoundError(
            'The resource you requested could not be found.'
          )
        );
      }

      console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + ('client ' + req.params.cid).yellow + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

      res.send(200, doc);
      next();

    });

  });

  // DELETE CLIENT
  server.del('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + ('client ' + req.params.cid).yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Client.remove({ cid: req.params.cid }, function(err, docs){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      MainConf.findOne({ blip: 1 }, function(err, mc){
        if(err){
          console.error("ERROR".red, err);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        Config.findOneAndUpdate({ cid: mc.currentconfig }, { $pull: { clients: req.params.cid } }, function(err, doc){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + ('client ' + req.params.cid).yellow + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

          res.send(204);
          next();

        });

      });

    });

  });


  // CLIENT REPORT
  server.put('/clients/report/:chash', innerAuth.adminAuth, (req, res, next) => {

    let date = 'YYYY-MM-DDThh:mm:ss'.timestamp;

    Client.findOneAndUpdate({ hash: req.params.chash }, { datereported: date, ipaddr: req.body.ip, interval: req.body.interval }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      } else if (!doc){
        return next(
          new errors.ResourceNotFoundError(
            'The resource you requested could not be found.'
          )
        );
      }

      console.log('[MM-DD-YY] hh:mm    '.timestamp + ('client ' + doc.name).yellow + ' reporting from ' + req.connection.remoteAddress.cyan);

      res.send(200, doc);
      next();

    });

  });

  // CLIENT RETRIEVE
  server.get('/clients/report/:chash', innerAuth.adminAuth, (req, res, next) => {

    Client.findOne({ hash: req.params.chash }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      } else if (!doc){
        return next(
          new errors.ResourceNotFoundError(
            'The resource you requested could not be found.'
          )
        );
      }

      console.log('[MM-DD-YY] hh:mm    '.timestamp + ('client ' + doc.name).yellow + ' requesting settings from ' + req.connection.remoteAddress.cyan);

      res.send(200, doc);
      next();

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

          res.send(204);
          next();
        });

      });

    });

  });

};
