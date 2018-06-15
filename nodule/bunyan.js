const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const fs = require('fs');

const colors = require('colors');
const timestamp = require('console-timestamp');
const stripAnsi = require('strip-ansi');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');
const Client = require('../models/client');

const TEXTMODELBEGIN = '[MM-DD-YY] hh:mm    ';
const TEXTMODELTELL = "                    \u2502 ".green;
const TEXTMODELCONCLUDE = "                    \u2514 ".green;
const TEXTMODELCONCLUDEEOL = "\n";

var deeplogging = 8;

var logfile = fs.createWriteStream("logs/Godwatch_MM-DD-YYYY_logfile.log".timestamp, { flags: "a+" } );

function init(){

  log("----------------------- SERVER START AT MM-DD-YYYY hh:ss -----------------------\n".timestamp, -1);

}

function begin(message){

  log(TEXTMODELBEGIN.timestamp + message, 0);

}

function tell(message){

  log(TEXTMODELTELL + message, 1);

}

function conclude(message){

  log(TEXTMODELCONCLUDE + message + TEXTMODELCONCLUDEEOL, 0);

}

function succeed(message){

  if(message){

    conclude('SUCCESS: '.green + message);

  } else {

    conclude('SUCCESS'.green);

  }

}

function fail(message){

  if(message){

    conclude('FAILURE: '.red + message);

  } else {

    conclude('FAILURE'.red);

  }

}

function notify(message, loglevel){

  log(TEXTMODELBEGIN.timestamp + message + TEXTMODELCONCLUDEEOL, loglevel);

}

function log(message, loglevel){

  console.log(message);

  if(loglevel < deeplogging){
    logfile.write(stripAnsi(message)+"\n");
  }

}

function error(message){

  console.error(message);

  //logfile.write(message+"\n");

}

module.exports = {init, begin, tell, conclude, succeed, fail, notify, log, error}
