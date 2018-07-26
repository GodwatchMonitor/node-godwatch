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
const Configurate = require('../nodule/configurate');
const Bunyan = require('../nodule/bunyan');

module.exports = function(server) {

  // CREATE CLIENT
  server.post('/clients', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('NEW '.green + 'client '.yellow + 'request from '.gray + req.connection.remoteAddress.cyan);

    if(!req.is('application/json')){
      Bunyan.conclude("ERROR: ".red + "Submitted data is not JSON.".gray);
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    let data = req.body || {};

    Bunyan.tell("Checking if the name already exists...".gray);

    Client.findOne({ name: data.name }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(doc == null){ // If the name doesn't exist

        Bunyan.tell("Name does not exist, continuing...".gray);

        let cli = new Client(data);

        cli.datereported = "None";
        cli.timesmissing = 0;
        cli.ipaddr = "None";
        cli.enabled = false;
        cli.missing = false;
        cli.timesmissing = -1;
        cli.timesreported = 0;
        cli.fluctuation = 0;
        cli.averagereport = doc.interval;
        cli.lastreportoffset = 0;

        Bunyan.tell("Saving client entry...".gray);

        cli.save(function(err){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(new errors.InternalError(err.message));
          }

          Bunyan.tell("Saved successfully, adding ".gray + "cid ".cyan + String(cli.cid).cyan + " to configuration file...".gray);

          Configurate.addConfigClients(cli.cid, function(err){

            if(err){
              Bunyan.conclude("ERROR: ".red + err.message.gray);
              return next(new errors.InternalError(err.message));
            }

            Bunyan.tell("Successfully added client to configuration, initalizing timer...".gray);

            Reporting.addTimer(cli.cid, cli.interval);

            Bunyan.tell("Initialized client timer, sending response...".gray);

            res.send(201, cli);

            Bunyan.succeed("Name: ".gray + cli.name.cyan + " | Interval: ".gray + String(cli.interval).cyan);

            next();

          });

        });

      } else {

        res.send(400);

        Bunyan.fail("Name exists in database.".gray);

        next();

      }

    });

  });

  // CREATE CLIENT FROM INSTALLER
  server.post('/clients/inst/new', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('NEW '.green + 'client '.yellow + 'request from '.gray + req.connection.remoteAddress.cyan + " (INSTALLER)".magenta);

    /*if(!req.is('application/json')){
      Bunyan.conclude("ERROR: ".red + "Submitted data is not JSON.".gray);
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }*/

    let data = JSON.parse(req.body) || {};

    Bunyan.tell("Checking if the name already exists...".gray);

    Client.findOne({ name: data.name }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(doc == null){ // If the name doesn't exist

        Bunyan.tell("Name does not exist, continuing...".gray);

        let cli = new Client(data);

        cli.datereported = "None";
        cli.timesmissing = 0;
        cli.ipaddr = "None";
        cli.enabled = false;
        cli.missing = false;
        cli.timesmissing = -1;
        cli.timesreported = 0;
        cli.fluctuation = 0;
        cli.averagereport = cli.interval;
        cli.lastreportoffset = 0;

        Bunyan.tell("Saving client entry...".gray);

        cli.save(function(err){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return next(new errors.InternalError(err.message));
          }

          Bunyan.tell("Saved successfully, adding ".gray + "cid ".cyan + String(cli.cid).cyan + " to configuration file...".gray);

          Configurate.addConfigClients(cli.cid, function(err){

            if(err){
              Bunyan.conclude("ERROR: ".red + err.message.gray);
              return next(new errors.InternalError(err.message));
            }

            Bunyan.tell("Successfully added client to configuration, initalizing timer...".gray);

            Reporting.addTimer(cli.cid, cli.interval);

            Bunyan.tell("Initialized client timer, sending response...".gray);

            res.send(200);

            Bunyan.succeed("Name: ".gray + cli.name.cyan + " | Interval: ".gray + String(cli.interval).cyan);

            next();

          });

        });

      } else {

        res.send(400);

        Bunyan.fail("Name exists in database.".gray);

        next();

      }

    });

  });

  // GET SINGLE CLIENT
  server.get('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

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

  // LIST CLIENTS
  server.get('/clients', innerAuth.adminAuth, (req, res, next) => {

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

  // UPDATE CLIENT
  server.put('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

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

  // DELETE CLIENT
  server.del('/clients/:cid', innerAuth.adminAuth, (req, res, next) => {

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

        Bunyan.fail("Client does not exist.".gray);

        next();

      }

    });

  });

  // DELETE CLIENT FROM INSTALLER
  server.post('/clients/inst/:name', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('DELETE '.green + 'client '.yellow + req.params.name.cyan + ' request from '.gray + req.connection.remoteAddress.cyan + ' (INSTALLER)'.magenta);

    Bunyan.tell("Checking if the client exists...".gray);

    Client.findOne({ name: req.params.name }, function(err, clienttoremove){

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

          Configurate.removeConfigClients(clienttoremove.cid, function(err, doc){

            if(err){
              Bunyan.conclude("ERROR: ".red + err.message.gray);
              return next(new errors.InternalError(err.message));
            }

            Bunyan.tell("Client removed from configuration, removing timer entry...".gray);

            Reporting.removeTimer(clienttoremove.cid);

            res.send(204);

            Bunyan.succeed()

            next();

          });

        });

      } else {

        res.send(200); // This line needs to send 200 or the uninstaller can't continue. This allows for deleting clients from the console as well as from the uninstaller. This shouldn't cause a conflict with an active client becuase the fields auto-fill in the uninstaller.

        Bunyan.fail("Client does not exist.".gray);

        next();

      }

    });

  });

  // CLIENT REPORT
  server.put('/clients/report/:name', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('REPORT'.green + ' client '.yellow + req.params.name.cyan + ' from '.gray + req.connection.remoteAddress.cyan);

    var date = 'YYYY-MM-DDThh:mm:ss:iii'.timestamp;

    Bunyan.tell("Checking if the client exists...".gray);

    Client.findOneAndUpdate({ name: req.params.name }, { datereported: date, ipaddr: req.body.ip, enabled: true, publicip: req.connection.remoteAddress }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!doc){

        res.send(404);

        Bunyan.fail("Client does not exist.".gray);

        next();

      } else {

        Bunyan.tell("Client exists. Running tests...".gray);

        if(!doc.enabled){

          Reporting.addTimer(doc.cid, doc.interval);

          Bunyan.tell("Client was not previously enabled. Enabled and initialized the timer.".gray);

        }

        Bunyan.tell("Gathering stats...".gray);

        let stats = {
          timesreported: doc.timesreported,
          averagereport: doc.averagereport,
          fluctuation: doc.fluctuation,
          lastreportoffset: doc.lastreportoffset,
          interval: doc.interval,
        }

        let datereported = doc.datereported;

        let ct = Reporting.date_difference(date.slice(0,-4), datereported.slice(0,-4), date.slice(-3), datereported.slice(-3)); //Difference in milleseconds. Should equal the interval (i.e. 15000)

        let fluctuation = ct - doc.interval//stats.lastreportoffset; //The difference in absolute time.

        if(doc.enabled){

          if(stats.timesreported > 0){

            if(Math.abs(fluctuation) > Math.abs(stats.fluctuation) && stats.timesreported > 0){
              stats.fluctuation = fluctuation;
            }

            stats.averagereport = ((stats.averagereport * stats.timesreported) + (stats.interval + fluctuation)) / (stats.timesreported + 1);

          } else {

            stats.averagereport = stats.interval;
            stats.lastreportoffset = ct;

          }

          stats.timesreported += 1;

        }

        if(doc.missing){
          stats.timesmissing = -1;
          stats.timesreported = 0;
          stats.fluctuation = 0;
          stats.averagereport = doc.interval;
          stats.lastreportoffset = 0;
        }

        Client.findOneAndUpdate({ cid: doc.cid }, { $set: stats }, function(err, ndoc){

          Bunyan.tell("Successfully gathered stats.".gray);
          Bunyan.tell("Times Reported: ".gray + String(stats.timesreported).cyan + " | Average Report: ".gray + String(stats.averagereport).cyan + " | Fluctuation: ".gray + String(fluctuation).cyan + " | Max Fluctuation: ".gray + String(stats.fluctuation).cyan);

          if(doc.missing){

            Reporting.checkClient(doc.cid);

            Bunyan.tell("Client was previously missing, manually performed check.".gray);

          }

          res.send(200, doc);

          Bunyan.succeed()

          next();

        });

      }

    });

  });

  // CLIENT RETRIEVE SETTINGS
  // This is different from GET SINGLE CLIENT because it injects data that the client needs to perform non-standard operations.
  server.get('/clients/report/:name', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('SETTINGS '.green + 'request for '.gray + 'client '.yellow + req.params.name.cyan + ' from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell("Checking if the client exists...".gray);

    Client.findOne({ name: req.params.name }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!doc){

        res.send(404);

        Bunyan.fail("Client does not exist.".gray);

        next();

      } else {

        Bunyan.tell("Client exists, getting latest version number...".gray);

        doc.version = server.config.clientversion;

        Bunyan.tell("Set latest version number to ".gray + String(doc.version).cyan);

        res.send(200, doc);

        Bunyan.succeed()

        next();

      }

    });

  });

  // GET CURRENT EXECUTABLE
  server.get('/clients/executable', innerAuth.adminAuth, (req, res, next) => {

    Bunyan.begin('EXE '.green + 'request from '.gray + req.connection.remoteAddress.cyan);

    Bunyan.tell("Retreiving file and writing to response...".gray);

    res.setHeader('Content-disposition', 'attachment; filename=newver.exe');

    var filestream = fs.createReadStream('./static/client'+String(server.config.clientversion)+'.exe');

    filestream.pipe(res);

    Bunyan.succeed();

    next();

  });

};
