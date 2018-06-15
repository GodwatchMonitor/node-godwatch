// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Recipient = require('../models/recipient');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const Configurate = require('../nodule/configurate');
const Bunyan = require('../nodule/bunyan');

module.exports = function(server) {

  // CREATE RECIPIENT
  server.post('/recipients', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('NEW '.green + 'recipient'.yellow + ' request from '.gray + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      Bunyan.conclude("ERROR: ".red + "Submitted data is not JSON.".gray);
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    let data = req.body || {};

    Bunyan.tell('Assigning data and saving entry...'.gray);

    let recip = new Recipient(data);

    recip.save(function(err){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      Bunyan.tell("Save recipient successfull, adding the rid to the configuration...".gray);

      Configurate.addConfigRecipients(recip.rid, function(err){

        if(err){
          Bunyan.conclude("ERROR: ".red + err.message.gray);
          return next(new errors.InternalError(err.message));
        }

        res.send(201, recip);

        Bunyan.succeed("Name: ".gray + recip.name.cyan + " | Address: ".gray + recip.address.cyan);

        next();

      });

    });

  });

  // GET SINGLE RECPIENT
  server.get('/recipients/:rid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('GET '.green + 'recipient '.yellow + req.params.rid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell('Checking if recipient exists...'.gray);

    Recipient.findOne({ rid: req.params.rid }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!doc){

        res.send(404);

        Bunyan.fail('Recipient does not exist.'.gray);

        next();

      } else {

        Bunyan.tell('Recipient exists, sending response...'.gray);

        res.send(200, doc);

        Bunyan.succeed();

        next();

      }

    });

  });

  // LIST RECIPIENTS
  server.get('/recipients', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('GET '.green + 'all recipients'.yellow + ' request from '.gray + req.connection.remoteAddress.cyan);

    Recipient.apiQuery(req.params, function(err, docs){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      res.send(200, docs);

      Bunyan.succeed(String(docs.length).gray + " recipients".gray);

      next();

    });

  });

  // UPDATE RECIPIENT
  server.put('/recipients/:rid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('UPDATE '.green + 'recipient '.yellow + req.params.rid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      Bunyan.conclude("ERROR: ".red + "Submitted data is not JSON.".gray);
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    let data = req.body || {};

    Bunyan.tell('Checking if recipient exists...'.gray);

    Recipient.findOneAndUpdate({ rid: req.params.rid }, { $set: data }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!doc){

        res.send(404);

        Bunyan.fail('Recipient does not exist.'.gray);

        next();

      } else {

        Bunyan.tell('Recipient exists, pushing data...'.gray);

        res.send(200, doc);

        Bunyan.succeed();

        next();

      }

    });

  });

  // DELETE RECIPIENT
  server.del('/recipients/:rid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('DELETE '.green + 'recipient '.yellow + req.params.rid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell('Checking if recipient exists...'.gray);

    Recipient.findOne({ rid: req.params.rid }, function(err, recipienttoremove){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(recipienttoremove){ // if it does exist

        Bunyan.tell("Recipient exists, removing...".gray);

        Recipient.remove({ rid: req.params.rid }, function(err, docs){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(new errors.InternalError(err.message));
          }

          Bunyan.tell("Remove recipient successful. Removing rid from configuration...".gray);

          Configurate.removeConfigRecipients(req.params.rid, function(err){

            res.send(204);

            Bunyan.succeed();

            next();

          });

        });

      } else {

        res.send(404);

        Bunyan.fail("Recipient does not exist.".gray);

        next();

      }

    });

  });

};
