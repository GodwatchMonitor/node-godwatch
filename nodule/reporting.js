const Client = require('../models/client');
const SysMail = require('../nodule/sys-mail');

function date_difference(date1, date2){

  // DATE class takes format YYYY-MM-DDThh:mm:ss
  date1obj = new Date(date1);
  date2obj = new Date(date2);

  return (date1obj - date2obj)/1000/60;
}

function check_client(cid, timer){

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

    ninterval = client.interval;

    console.log('[MM-DD-YY] hh:mm    '.timestamp + "CHECK ".green + "client ".yellow + client.name.cyan + " at interval " + String(client.interval).cyan);

    let date = 'YYYY-MM-DDThh:mm:ss'.timestamp;
    let datereported = client.datereported;

    let dif = date_difference(date, datereported)*60*1000;

    console.log(dif, client.interval*2);

    if(dif > client.interval*2){
      console.log('[MM-DD-YY] hh:mm    '.timestamp + "ALERT: ".red + "client ".yellow + client.name.cyan + " has not reported in the specified interval (" + String(client.interval).cyan + ")");
      SysMail.sendAlert(120, client.name + " has lost connectivity at " + '[MM-DD-YY] hh:mm'.timestamp);
    }

    clearInterval(timer);
    timer = setInterval(function() { check_client(client.cid, timer); }, client.interval);

  });

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
      console.log('[MM-DD-YY] hh:mm    '.timestamp + "INITIALIZE ".green + "client ".yellow + client.name.cyan + " at interval " + String(client.interval).cyan);
      let timer = setInterval(function() { check_client(client.cid, timer); }, client.interval);
    });

  });

  //setInterval(initialize, 5000);

}

module.exports = {initialize}
