// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const fs = require('fs');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Group = require('../models/group');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const Reporting = require('../nodule/reporting');
const Configurate = require('../nodule/configurate');
const Bunyan = require('../nodule/bunyan');

module.exports = function(server) {

  // CREATE GROUP
  server.post('/groups', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('NEW '.green + 'group '.yellow + 'request from '.gray + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      Bunyan.conclude("ERROR: ".red + "Submitted data is not JSON.".gray);
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    let data = req.body || {};

    Bunyan.tell("Checking if the name already exists...".gray);

    Group.findOne({ name: data.name }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(doc == null){ // If the name doesn't exist

        Bunyan.tell("Name does not exist, continuing...".gray);

        let group = new Group(data);

        group.version = server.config.clientversion;

        Bunyan.tell("Saving group entry...".gray);

        group.save(function(err){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(new errors.InternalError(err.message));
          }

          Bunyan.tell("Saved successfully.".gray);

          Bunyan.tell("Sending response...".gray);

          res.send(201, group);

          Bunyan.succeed("Name: ".gray + group.name.cyan);

          next();

        });

      } else {

        res.send(400);

        Bunyan.fail("Name exists in database.".gray);

        next();

      }

    });

  });

  // GET SINGLE GROUP
  server.get('/groups/:gid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('GET '.green + 'client '.yellow + req.params.cid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell("Checking if the client exists...".gray);

    Client.findOne({ cid: req.params.cid }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!doc){

        res.send(404);

        Bunyan.fail("Client does not exist.".gray);

        next();

      } else {

        Bunyan.tell("Client exists, sending response...".gray);

        res.send(200, doc);

        Bunyan.succeed()

        next();

      }

    });

  });

  // LIST GROUPS
  server.get('/groups', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('GET '.green + 'all clients'.yellow + ' request from '.gray + req.connection.remoteAddress.cyan);

    Client.apiQuery(req.params, function(err, docs){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      res.send(200, docs);

      Bunyan.succeed(String(docs.length).gray + " clients.".gray);

      next();

    });

  });

  // UPDATE GROUP
  server.put('/groups/:gid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('UPDATE '.green + 'client '.yellow + req.params.cid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      Bunyan.conclude("ERROR: ".red + "Submitted data is not JSON.".gray);
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    let data = req.body || {};

    Bunyan.tell("Checking if the client exists...".gray);

    Client.findOneAndUpdate({ cid: req.params.cid }, { $set: data }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!doc){

        res.send(404);

        Bunyan.fail("Client does not exist.".gray);

        next();

      } else {

        Bunyan.tell("Client exists, pushing data ".gray + JSON.stringify(data).gray);

        res.send(200, doc);

        Bunyan.succeed()

        next();

      }

    });

  });

  // DELETE GROUP
  server.del('/groups/:gid', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('DELETE '.green + 'client '.yellow + req.params.cid.cyan + ' request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell("Checking if the client exists...".gray);

    Client.findOne({ cid: req.params.cid }, function(err, clienttoremove){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(clienttoremove){ // if it exists

        Bunyan.tell("Client exists, deleting...".gray);

        Client.remove({ cid: clienttoremove.cid }, function(err, docs){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(new errors.InternalError(err.message));
          }

          Bunyan.tell("Client successfully removed, removing from configuration...".gray);

          Configurate.removeConfigClients(clienttoremove.cid, function(err){

            if(err){
              Bunyan.conclude("ERROR: ".red + err.message.gray);
              return next(new errors.InternalError(err.message));
            }

            Bunyan.tell("Client removed from configuration, removing timer entry...".gray);

            Reporting.removeTimer(req.params.cid);

            res.send(204);

            Bunyan.succeed()

            next();

          });

        });

      } else {

        res.send(404);

        Bunyan.fail("Group does not exist.".gray);

        next();

      }

    });

  });

};
