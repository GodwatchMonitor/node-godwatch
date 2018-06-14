const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');
const Client = require('../models/client');

const TEXTMODELBEGIN = '[MM-DD-YY] hh:mm    ';
const TEXTMODELTELL = "                    \u2502 ".green;
const TEXTMODELCONCLUDE = "                    \u2514 ".green;
const TEXTMODELCONCLUDEEOL = "\n";

function begin(message){

  log(TEXTMODELBEGIN.timestamp + message);

}

function tell(message){

  log(TEXTMODELTELL + message);

}

function conclude(message){

  log(TEXTMODELCONCLUDE + message + TEXTMODELCONCLUDEEOL);

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

function notify(message){

  log(TEXTMODELBEGIN.timestamp + message + TEXTMODELCONCLUDEEOL);

}

function log(message){

  console.log(message);

}

function error(message){

  console.error(message);

}

module.exports = {begin, tell, conclude, succeed, fail, notify, log, error}
