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

  // CREATE CLIENT
  server.post('/clients', innerAuth.adminAuth, (req, res, next) => {

    if(!req.is('application/json')){
      return next(
        new errors.InvalidContentError("Expects 'application/json'")
      );
    }

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan);

    let data = req.body || {};

    console.log("                    \u2502 ".green + "Checking if the name already exists...".gray);

    Client.findOne({ name: data.name }, function(err, doc){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(doc == null){ // If the name doesn't exist

        console.log("                    \u2502 ".green + "Name does not exist, continuing...".gray);

        let cli = new Client(data);

        cli.datereported = "None";
        cli.timesmissing = 0;
        cli.ipaddr = "None";
        cli.enabled = false;

        console.log("                    \u2502 ".green + "Creating client hash... ".gray + "WARNING: ".red + "Hashing will probably be deprecated in future releases.".gray);

        cli.hash = (function() {
          let ns = "";
          for(var i=0; i < cli.name.length; i++){
            ns += String.fromCharCode(cli.name.charCodeAt(i)*(i+1));
          }
          return ns;
        })();

        console.log("                    \u2502 ".green + "Client hash set to ".gray + cli.hash.cyan + ".".gray);

        console.log("                    \u2502 ".green + "Saving client entry...".gray);

        cli.save(function(err){

          if(err){
            console.log("                    \u2514 ".green + "ERROR".red, err.red);
            return next(new errors.InternalError(err.message));
            next();
          }

          console.log("                    \u2502 ".green + "Saved successfully, adding ".gray + "cid ".cyan + String(cli.cid).cyan + " to configuration file...".gray);

          Changer.addConfigClients(cli.cid, function(err){

            if(err){
              console.log("                    \u2514 ".green + "ERROR".red, err.red);
              return next(
                new errors.InvalidContentError(err)
              );
            }

            console.log("                    \u2502 ".green + "Successfully added client to configuration, initalizing timer...".gray);

            Reporting.addTimer(cli.cid, cli.interval);

            console.log("                    \u2502 ".green + "Initialized client timer, sending response...".gray);

            res.send(201, cli);

            console.log("                    \u2514 ".green + "SUCCESS\n".green);

            next();

          });

        });

      } else {

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Name exists in database.\n".gray);

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

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'NEW '.green + 'client'.yellow + ' request from ' + req.connection.remoteAddress.cyan + " (INSTALLER)".magenta);

    let data = JSON.parse(req.body) || {};

    console.log("                    \u2502 ".green + "Checking if the name already exists...".gray);

    Client.findOne({ name: data.name }, function(err, doc){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(doc == null){ // If the name doesn't exist

        console.log("                    \u2502 ".green + "Name does not exist, continuing...".gray);

        let cli = new Client(data);

        cli.datereported = "None";
        cli.timesmissing = 0;
        cli.ipaddr = "None";
        cli.enabled = false;
        cli.missing = false;
        cli.enabled = false;

        console.log("                    \u2502 ".green + "Creating client hash... ".gray + "WARNING: ".red + "Hashing will probably be deprecated in future releases.".gray);

        cli.hash = (function() {
          let ns = "";
          for(var i=0; i < cli.name.length; i++){
            ns += String.fromCharCode(cli.name.charCodeAt(i)*(i+1));
          }
          return ns;
        })();

        console.log("                    \u2502 ".green + "Client hash set to ".gray + cli.hash.cyan + ".".gray);

        console.log("                    \u2502 ".green + "Saving client entry...".gray);

        cli.save(function(err){

          if(err){
            console.log("                    \u2514 ".green + "ERROR".red, err.red);
            return next(new errors.InternalError(err.message));
            next();
          }

          console.log("                    \u2502 ".green + "Saved successfully, adding ".gray + "cid ".cyan + String(cli.cid).cyan + " to configuration file...".gray);

          Changer.addConfigClients(cli.cid, function(err){

            if(err){
              console.log("                    \u2514 ".green + "ERROR".red, err.red);
              return next(
                new errors.InvalidContentError(err)
              );
            }

            console.log("                    \u2502 ".green + "Successfully added client to configuration, initalizing timer...".gray);

            Reporting.addTimer(cli.cid, cli.interval);

            console.log("                    \u2502 ".green + "Initialized client timer, sending response...".gray);

            res.send(200);

            console.log("                    \u2514 ".green + "SUCCESS\n".green);

            next();

          });

        });

      } else {

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Name exists in database.\n".gray);

        res.send(400);
        next();

      }

    });

  });

  // GET SINGLE CLIENT
  server.get('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'client '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan);

    console.log("                    \u2502 ".green + "Checking if the client exists...".gray);

    Client.findOne({ cid: req.params.cid }, function(err, doc){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(!doc){

        res.send(404);

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Client does not exist.\n".gray);

        next();

      } else {

        console.log("                    \u2502 ".green + "Client exists, sending response...".gray);

        res.send(200, doc);

        console.log("                    \u2514 ".green + "SUCCESS\n".green);

        next();

      }

    });

  });

  // LIST CLIENTS
  server.get('/clients', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'all clients'.yellow + ' request from ' + req.connection.remoteAddress.cyan);

    Client.apiQuery(req.params, function(err, docs){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      res.send(200, docs);

      console.log("                    \u2514 ".green + "SUCCESS: ".green + String(docs.length).gray + " clients.".gray);

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

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'UPDATE '.green + 'client '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan);

    console.log("                    \u2502 ".green + "Checking if the client exists...".gray);

    Client.findOneAndUpdate({ cid: req.params.cid }, { $set: data }, function(err, doc){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(!doc){

        res.send(404);

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Client does not exist.\n".gray);

        next();

      } else {

        console.log("                    \u2502 ".green + "Client exists, pushing data ".gray + JSON.stringify(data).gray);

        res.send(200, doc);

        console.log("                    \u2514 ".green + "SUCCESS\n".green);

        next();

      }

    });

  });

  // DELETE CLIENT
  server.del('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + 'client '.yellow + req.params.cid.cyan + ' request from ' + req.connection.remoteAddress.cyan);

    console.log("                    \u2502 ".green + "Checking if the client exists...".gray);

    Client.findOne({ cid: req.params.cid }, function(err, clienttoremove){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(clienttoremove){ // if it exists

        console.log("                    \u2502 ".green + "Client exists, deleting...".gray);

        Client.remove({ cid: clienttoremove.cid }, function(err, docs){

          if(err){
            console.log("                    \u2514 ".green + "ERROR".red, err.red);
            return next(
              new errors.InvalidContentError(err)
            );
          }

          console.log("                    \u2502 ".green + "Client successfully removed, removing from configuration...".gray);

          Changer.removeConfigClients(clienttoremove.cid, function(err){

            if(err){
              console.log("                    \u2514 ".green + "ERROR".red, err.red);
              return next(
                new errors.InvalidContentError(err)
              );
            }

            console.log("                    \u2502 ".green + "Client removed from configuration, removing timer entry...".gray);

            Reporting.removeTimer(req.params.cid);

            res.send(204);

            console.log("                    \u2514 ".green + "SUCCESS\n".green);

            next();

          });

        });

      } else {

        res.send(404);

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Client does not exist.\n".gray);

        next();

      }

    });

  });

  // DELETE CLIENT FROM INSTALLER
  server.post('/clients/inst/:name', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'DELETE '.green + 'client '.yellow + req.params.name.cyan + ' request from ' + req.connection.remoteAddress.cyan + ' (INSTALLER)'.magenta);

    console.log("                    \u2502 ".green + "Checking if the client exists...".gray);

    Client.findOne({ name: req.params.name }, function(err, clienttoremove){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(clienttoremove){ // if it exists

        console.log("                    \u2502 ".green + "Client exists, deleting...".gray);

        Client.remove({ cid: clienttoremove.cid }, function(err, docs){

          if(err){
            console.log("                    \u2514 ".green + "ERROR".red, err.red);
            return next(
              new errors.InvalidContentError(err)
            );
          }

          console.log("                    \u2502 ".green + "Client successfully removed, removing from configuration...".gray);

          Changer.removeConfigClients(clienttoremove.cid, function(err, doc){

            if(err){
              console.log("                    \u2514 ".green + "ERROR".red, err.red);
              return next(
                new errors.InvalidContentError(err)
              );
            }

            console.log("                    \u2502 ".green + "Client removed from configuration, removing timer entry...".gray);

            Reporting.removeTimer(clienttoremove.cid);

            res.send(204);

            console.log("                    \u2514 ".green + "SUCCESS\n".green);

            next();

          });

        });

      } else {

        res.send(200); // This line needs to send 200 or the uninstaller can't continue. This allows for deleting clients from the console as well as from the uninstaller. This shouldn't cause a conflict with an active client becuase the fields auto-fill in the uninstaller.

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Client does not exist.\n".gray);

        next();

      }

    });

  });

  // CLIENT REPORT
  server.put('/clients/report/:chash', innerAuth.adminAuth, (req, res, next) => {

    let date = 'YYYY-MM-DDThh:mm:ss'.timestamp;

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'REPORT'.green + ' client '.yellow + req.params.chash + ' from ' + req.connection.remoteAddress.cyan);

    console.log("                    \u2502 ".green + "Checking if the client exists...".gray);

    Client.findOneAndUpdate({ hash: req.params.chash }, { datereported: date, ipaddr: req.body.ip, enabled: true }, function(err, doc){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(!doc){

        res.send(404);

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Client does not exist.\n".gray);

        next();

      } else {

        console.log("                    \u2502 ".green + "Client exists. Running tests...".gray);

        if(!doc.enabled){

          Reporting.addTimer(doc.cid, doc.interval);

          console.log("                    \u2502 ".green + "Client was not previously enabled. Enabled and initialized the timer.".gray);

        }

        if(doc.missing){

          Reporting.checkClient(doc.cid);

          console.log("                    \u2502 ".green + "Client was previously missing, manually performed check.".gray);

        }

        res.send(200, doc);

        console.log("                    \u2514 ".green + "SUCCESS\n".green);

        next();

      }

    });

  });

  // CLIENT RETRIEVE SETTINGS
  server.get('/clients/report/:chash', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'GET '.green + 'client '.yellow + req.params.chash + ' settings request from ' + req.connection.remoteAddress.cyan);

    console.log("                    \u2502 ".green + "Checking if the client exists...".gray);

    Client.findOne({ hash: req.params.chash }, function(err, doc){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      if(!doc){

        res.send(404);

        console.log("                    \u2514 ".green + "FAILURE: ".red + "Client does not exist.\n".gray);

        next();

      } else {

        console.log("                    \u2502 ".green + "Client exists, getting latest version number...".gray);

        Changer.getConfig(function(err, conf){

          if(err){
            console.log("                    \u2514 ".green + "ERROR".red, err.red);
            return next(
              new errors.InvalidContentError(err)
            );
          }

          doc.version = conf.clientversion;

          console.log("                    \u2502 ".green + "Set latest version number to ".gray + String(doc.version).cyan);

          res.send(200, doc);

          console.log("                    \u2514 ".green + "SUCCESS\n".green);

          next();

        });

      }

    });

  });

  // GET CURRENT EXECUTABLE
  server.get('/clients/executable', innerAuth.adminAuth, (req, res, next) => {

    console.log('[MM-DD-YY] hh:mm    '.timestamp + 'EXE '.green + 'request from ' + req.connection.remoteAddress.cyan);

    console.log("                    \u2502 ".green + "Retriving file and writing to response...".gray);

    res.setHeader('Content-disposition', 'attachment; filename=newver.exe');

    Changer.getConfig(function(err, conf){

      if(err){
        console.log("                    \u2514 ".green + "ERROR".red, err.red);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      var filestream = fs.createReadStream('./static/client'+String(conf.currentversion)+'.exe');

      filestream.pipe(res);

      console.log("                    \u2514 ".green + "SUCCESS\n".green);

      next();

    });

  });

};
