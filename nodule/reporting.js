const Client = require('../models/client');
const errors = require('restify-errors');
const SysMail = require('../nodule/sys-mail');
const Bunyan = require('../nodule/bunyan');
const async = require('async');
const isOnline = require('is-online');

var timers = {};

function date_difference(date1, date2, mm1, mm2){

  // DATE class takes format YYYY-MM-DDThh:mm:ss
  date1obj = new Date(date1);
  date2obj = new Date(date2);

  date1obj = new Date(date1obj.getTime() + Number(mm1));
  date2obj = new Date(date2obj.getTime() + Number(mm2));

  return (date1obj.getTime() - date2obj.getTime());

}

function addTimer(cid, interval){

  timers[String(cid)] = setTimeout(function() { checkClient(cid); }, interval);
  timers[String(cid)].offset = 0;

}

function removeTimer(cid){

  clearTimeout(timers[cid]);
  delete timers[cid];

}

function resetAllTimers(){

  Object.keys(timers).forEach(function(cid){ clearTimeout(timers[cid]); });

  timers = {};

  initialize();

}

function checkClient(cid){

  let start = 'YYYY-MM-DDThh:mm:ss:iii'.timestamp;

  isOnline().then(online => {

    Client.findOne({ cid: cid }, function(err, client){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message));
      }

      if(!client){

        Bunyan.fail("Client does not exist.".gray);
        return next(new errors.ResourceNotFoundError('The resource you requested could not be found.'));

      } else {

        ndata = {};

        ninterval = client.interval;

        if(client.enabled){

          Bunyan.begin("CHECK ".green + "client ".yellow + client.name.cyan + " at interval ".gray + String(client.interval).cyan);

          let date = 'YYYY-MM-DDThh:mm:ss:iii'.timestamp;
          let datereported = client.datereported;

          let current_interval = timers[client.cid]._idleTimeout + timers[client.cid].offset;

          Bunyan.tell("Comparing current time with last time reported...".gray);

          let dif = date_difference(date.slice(0,-4), datereported.slice(0,-4), date.slice(-3), datereported.slice(-3));

          Bunyan.tell("Client has not reported in ".gray + String(dif).cyan + " milliseconds.".gray);

          // If the client is missing
          if(dif > current_interval*client.tolerance){

            Bunyan.tell("Client has not reported in the specified time frame (".gray + String(current_interval).gray + ").".gray);

            // If the client
            if(client.timesmissing >= 0){

              Bunyan.tell("ALERT: Client is missing. It has either lost network connectivity, lost power, or had the Godwatch Client exited.".red);

              if(!client.missing){ //Only send alert the first time

                Bunyan.tell("Checking server connectivity...".gray);

                if(online){

                  Bunyan.tell("Server is online. Checking remote network...".gray);

                  Client.apiQuery({ publicip: client.publicip }, function(err, clientsonnet){

                    if(err){
                      Bunyan.conclude("ERROR: ".red + err.message.gray);
                      return next(new errors.InternalError(err.message));
                    }

                    if(clientsonnet.length < 1){

                      Bunyan.tell("Sending alert...".gray);

                      SysMail.sendAlerts("Godwatch Alert", client.name + " has lost connectivity at " + '[MM-DD-YY] hh:mm'.timestamp);

                    } else {
                      let numOffline = 0;
                      clientsonnet.forEach(function(nclient){
                        if(nclient.missing){
                          numOffline += 1;
                        }
                      });

                      console.log(numOffline);
                      console.log(clientsonnet);

                      if(numOffline > 0){

                        Bunyan.tell("Sending alert...".gray);

                        SysMail.sendAlerts("Godwatch Alert", client.name + " has lost connectivity at " + '[MM-DD-YY] hh:mm'.timestamp +". Other clients on this network have also gone missing, the network might be down.");

                      } else {

                        Bunyan.tell("Sending alert...".gray);

                        SysMail.sendAlerts("Godwatch Alert", client.name + " has lost connectivity at " + '[MM-DD-YY] hh:mm'.timestamp);

                      }

                    }

                  });

                  ndata.missing = true;

                } else {

                  Bunyan.tell("This server seems to have lost internet connection, will not send alert.".gray);
                  resetTimesMissing();

                }

              } else {

                Bunyan.tell("Client was already flagged as missing. No alert will be sent.".gray);

              }

            } else {

              Bunyan.tell("Client is currently in grace period due to a server restart, overlooking.".gray);

            }

          } else {

            Bunyan.tell("Client is within specified interval.".gray);

            if(client.missing){ //Send reconnection alert

              Bunyan.tell("Client was previously missing, sending reconnection alert...".gray);

              SysMail.sendAlerts("Godwatch Alert", client.name + " has regained connectivity at " + '[MM-DD-YY] hh:mm'.timestamp);

              ndata.missing = false;

            }

          }

          // If we are missing and we weren't before
          if(dif > current_interval*client.tolerance || client.timesmissing == -1){

            ndata.timesmissing = client.timesmissing+1;

          }

          Client.findOneAndUpdate({ cid: cid }, { $set: ndata }, function(err, clinew){

            if(err){
              Bunyan.conclude("ERROR: ".red + err.message.gray);
              return next(new errors.InternalError(err.message));
            }

            if(!clinew){

              Bunyan.fail("Client does not exist.".gray);
              return next(new errors.ResourceNotFoundError('The resource you requested could not be found.'));

            }

          });

          Bunyan.tell("Resetting timer...".gray);

          clearTimeout(timers[String(client.cid)]);

          let end = 'YYYY-MM-DDThh:mm:ss:iii'.timestamp;

          let off = date_difference(end.slice(0,-4), start.slice(0,-4), end.slice(-3), start.slice(-3));

          timers[String(client.cid)] = setTimeout(function() { checkClient(client.cid); }, client.interval - off);
          timers[String(client.cid)].offset = off;

          Bunyan.conclude("SUCCESS".green);

        } else {

          Bunyan.conclude("FAILURE: ".red + "Client is not enabled.".gray);

        }

      }

    });

  });

}

function resetTimesMissing(){

  Client.apiQuery({}, function(err, docs){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return new errors.InternalError(err.message);
    }

    async.eachOf(docs, function(client, index, callback){

      if(client.enabled){

        Client.findOneAndUpdate({ cid: client.cid }, { timesmissing: -1 }, function(err, clinew){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return new errors.InternalError(err.message);
          }

          if(!clinew){

            Bunyan.fail("Client does not exist.".gray);
            return new errors.ResourceNotFoundError('The resource you requested could not be found.');

          } else {

            callback();

          }

        });

      } else {

        callback();

      }

    }, function(err){

      if(err){

        Bunyan.fail(err.message.gray);
        return new errors.InternalError('Unknown error.');

      } else {

        Bunyan.conclude("SUCCESS: ".green + String(docs.length).gray + " stats reset.".gray);

      }

    });

  });

}

function initialize(){

  Bunyan.begin("INITIALIZE ".green + "all timers...".yellow);

  Client.apiQuery({}, function(err, docs){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return new errors.InternalError(err.message);
    }

    async.eachOf(docs, function(client, index, callback){

      if(client.enabled){

        Client.findOneAndUpdate({ cid: client.cid }, { timesmissing: -1, timesreported: 0, fluctuation: 0, averagereport: client.interval, lastreportoffset: 0 }, function(err, clinew){

          if(err){
            Bunyan.conclude("ERROR: ".red + err.message.gray);
            return new errors.InternalError(err.message);
          }

          if(!clinew){

            Bunyan.fail("Client does not exist.".gray);
            return new errors.ResourceNotFoundError('The resource you requested could not be found.');

          } else {

            timers[String(client.cid)] = setTimeout(function() { checkClient(client.cid); }, client.interval+(index*10));
            timers[String(client.cid)].offset = 0;

            Bunyan.tell("Initialized ".gray + client.name.cyan + " at interval ".gray + String(client.interval+(index*10)).cyan);

            callback();

          }

        });

      } else {

        callback();

      }

    }, function(err){

      if(err){

        Bunyan.fail(err.message.gray);
        return new errors.InternalError('Unknown error.');

      } else {

        Bunyan.conclude("SUCCESS: ".green + String(docs.length).gray + " timers initialized.".gray);

      }

    });

  });

}

module.exports = {initialize, resetTimesMissing, resetAllTimers, checkClient, date_difference, addTimer, removeTimer}
