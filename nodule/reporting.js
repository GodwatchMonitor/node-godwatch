const Client = require('../models/client');
const errors = require('restify-errors');
const SysMail = require('../nodule/sys-mail');

var timers = [];

function date_difference(date1, date2){

  // DATE class takes format YYYY-MM-DDThh:mm:ss
  date1obj = new Date(date1);
  date2obj = new Date(date2);

  return (date1obj - date2obj)/1000/60;

}

function check_client(cid){

  Client.findOne({ cid: cid }, function(err, client){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    } else if (!client){
      console.error("ERROR".red, err);
      return new errors.ResourceNotFoundError(
          'The resource you requested could not be found.'
        )
    }

    ndata = {};

    ninterval = client.interval;

    console.log('[MM-DD-YY] hh:mm    '.timestamp + "CHECK ".green + "client ".yellow + client.name.cyan + " at interval " + String(client.interval).cyan);

    let date = 'YYYY-MM-DDThh:mm:ss'.timestamp;
    let datereported = client.datereported;

    let dif = date_difference(date, datereported)*60*1000;

    if(dif > client.interval*client.tolerance){

      if(client.timesmissing >= 0){

        console.log('[MM-DD-YY] hh:mm    '.timestamp + "ALERT: ".red + "client ".yellow + client.name.cyan + " has not reported in the specified interval (" + String(client.interval).cyan + ")");

        if(!client.missing){ //Only send alert the first time

          SysMail.sendAlerts("Godwatch Alert", client.name + " has lost connectivity at " + '[MM-DD-YY] hh:mm'.timestamp);
          ndata.missing = true;

        }

      }

    } else {

      if(client.missing){ //Send reconnection alert

        SysMail.sendAlerts("Godwatch Alert", client.name + " has regained connectivity at " + '[MM-DD-YY] hh:mm'.timestamp);
        ndata.missing = false;

      }

    }

    if(dif > client.interval*client.tolerance || client.timesmissing == -1){
      ndata.timesmissing = client.timesmissing+1;
    }

    Client.findOneAndUpdate({ cid: cid }, { $set: ndata }, function(err, clinew){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      } else if (!client){
        console.error("ERROR".red, err);
        return new errors.ResourceNotFoundError(
            'The resource you requested could not be found.'
          )
      }

    });

    clearInterval(timers[client.cid]);
    if(client.enabled){
      timers[client.cid] = setInterval(function() { check_client(client.cid); }, client.interval);
    }

  });

}

function resetAllTimers(){

  for(var i = 0; i < timers.length; i++){ clearInterval(timers[i]); }

  timers = [];

  initialize();

}

function initialize(){

  Client.apiQuery({}, function(err, docs){

    if(err){
      console.log("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    }

    docs.forEach(function(client){

      if(client.enabled){

        console.log('[MM-DD-YY] hh:mm    '.timestamp + "INITIALIZE ".green + "client ".yellow + client.name.cyan + " at interval " + String(client.interval).cyan);

        timers[client.cid] = setInterval(function() { check_client(client.cid); }, client.interval);

        Client.findOneAndUpdate({ cid: client.cid }, { timesmissing: -1 }, function(err, clinew){

          if(err){
            console.error("ERROR".red, err);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          } else if (!client){
            console.error("ERROR".red, err);
            return new errors.ResourceNotFoundError(
                'The resource you requested could not be found.'
              )
          }

        });

      }

    });

  });

  //setInterval(initialize, 5000);

}

module.exports = {initialize, resetAllTimers}
