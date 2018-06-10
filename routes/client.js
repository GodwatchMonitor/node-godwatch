// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const fs = require('fs');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Client = require('../models/client');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const Reporting = require('../nodule/reporting');
const Changer = require('../nodule/changer');

module.exports = function(server) {

  /*
    CLIENT ROUTES
  */

  // CREATE CLIENT
  server.post('/clients', innerAuth.adminAuth, (req, res, next) => {

    if(!req.is('application/json')){
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    let data = req.body || {};

    Client.findOne({ name: data.name }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      if(doc == null){ // If the name doesn't exist

        let cli = new Client(data);

        cli.datereported = "None";
        cli.timesmissing = 0;
        cli.ipaddr = "None";
        cli.enabled = false;

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

          Changer.addConfigClients(cli.cid, function(err){

            if(err){
              console.error("ERROR".red, err);
              return next(
                new errors.InvalidContentError(err.errors.name.message)
              );
            }

            console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

            Reporting.addTimer(cli.cid, cli.interval);

            res.send(201, cli);
            next();

          });

        });

      } else {

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan + " failed (name exists).".red);

        res.send(400);
        next();

      }

    });

  });

  // CREATE CLIENT FROM INSTALLER
  server.post('/clients/inst/new', innerAuth.adminAuth, (req, res, next) => {

    /*if(!req.is('application/json')){
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }*/

    let data = JSON.parse(req.body) || {};

    Client.findOne({ name: data.name }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      if(doc == null){ // If the name doesn't exist

        let cli = new Client(data);

        cli.datereported = "None";
        cli.timesmissing = 0;
        cli.ipaddr = "None";
        cli.enabled = false;
        cli.missing = false;
        cli.enabled = false;

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

          Changer.addConfigClients(cli.cid, function(err){

            if(err){
              console.error("ERROR".red, err);
              return next(
                new errors.InvalidContentError(err.errors.name.message)
              );
            }

            console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan + " successful.".green);

            Reporting.addTimer(cli.cid, cli.interval);

            res.send(200);
            next();

          });

        });

      } else {

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan + " failed (name exists).".red);

        res.send(400);
        next();

      }

    });

  });

  // GET SINGLE CLIENT
  server.get('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    Client.findOne({ cid: req.params.cid }, function(err, doc){

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

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'client '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

        res.send(200, doc);
        next();

      }

    });

  });

  // LIST CLIENTS
  server.get('/clients', innerAuth.adminAuth, (req, res, next) => {

    Client.apiQuery(req.params, function(err, docs){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'all clients'.yellow + ' request from ' + req.connection.remoteAddress.cyan);

      res.send(200, docs);
      next();

    });

  });

  // UPDATE CLIENT
  server.put('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

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
      }

      if(!doc){

        res.send(404);
        next();

      } else {

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + 'client '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

        res.send(200, doc);
        next();

      }

    });

  });

  // DELETE CLIENT
  server.del('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    Client.findOne({ cid: req.params.cid }, function(err, clienttoremove){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      if(clienttoremove){ // if it exists

        Client.remove({ cid: clienttoremove.cid }, function(err, docs){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          Changer.removeConfigClients(clienttoremove.cid, function(err){

            if(err){
              console.error("ERROR".red, err);
              return next(
                new errors.InvalidContentError(err.errors.name.message)
              );
            }

            Reporting.removeTimer(req.params.cid);

            console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + 'client '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

            res.send(204);
            next();

          });

        });

      } else {

        res.send(404);
        next();

      }

    });

  });

  // DELETE CLIENT FROM INSTALLER
  server.post('/clients/inst/:name', innerAuth.adminAuth, (req, res, next) => {

    Client.findOne({ name: req.params.name }, function(err, clienttoremove){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      if(clienttoremove){ // if it exists

        Client.remove({ cid: clienttoremove.cid }, function(err, docs){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          Changer.removeConfigClients(clienttoremove.cid, function(err, doc){

            if(err){
              console.error("ERROR".red, err);
              return next(
                new errors.InvalidContentError(err.errors.name.message)
              );
            }

            Reporting.removeTimer(clienttoremove.cid);

            console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + 'client '.yellow + req.params.name.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

            res.send(204);
            next();

          });

        });

      } else {

        res.send(200); // This line needs to send 200 or the uninstaller can't continue. This allows for deleting clients from the console as well as from the uninstaller.
        next();

      }

    });

  });


  // CLIENT REPORT
  server.put('/clients/report/:chash', innerAuth.adminAuth, (req, res, next) => {

    let date = 'YYYY-MM-DDThh:mm:ss'.timestamp;

    Client.findOneAndUpdate({ hash: req.params.chash }, { datereported: date, ipaddr: req.body.ip, enabled: true }, function(err, doc){

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

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'Client '.yellow + doc.name.cyan + ' reporting from ' + req.connection.remoteAddress.cyan);

        if(!doc.enabled){

          Reporting.addTimer(doc.cid, doc.interval);

        }

        if(doc.missing){
          Reporting.checkClient(doc.cid);
        }

        res.send(200, doc);
        next();

      }

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
      }

      if(!doc){

        res.send(404);
        next();

      } else {

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'client '.yellow + doc.name.cyan + ' settings request from ' + req.connection.remoteAddress.cyan + ' successful.'.green);

        getConfig(function(err, conf){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          doc.version = conf.clientversion;

          res.send(200, doc);
          next();

        });

      }

    });

  });

  // GET CURRENT EXECUTABLE
  server.get('/clients/executable', innerAuth.adminAuth, (req, res, next) => {

    res.setHeader('Content-disposition', 'attachment; filename=newver.exe');

    //console.log("Getting EXE");

    getConfig(function(err, conf){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      var filestream = fs.createReadStream('./static/client'+String(conf.currentversion)+'.exe');
      filestream.pipe(res);
      next();

    });

  });

};
