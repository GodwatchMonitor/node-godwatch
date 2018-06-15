const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');

const colors = require('colors');
const timestamp = require('console-timestamp');
const prompt = require('readline-sync');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');
const Client = require('../models/client');

const Bunyan = require('../nodule/bunyan');

function removeConfigRecipients(rid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return next(new errors.InternalError(err.message.red));
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $pull: { recipients: rid } }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message.red));
      }

      callback(err);

    });

  });

}

function addConfigRecipients(rid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return next(new errors.InternalError(err.message.red));
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { recipients: rid } }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message.red));
      }

      callback(err);

    });

  });

}

function removeConfigClients(cid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return next(new errors.InternalError(err.message.red));
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $pull: { clients: cid } }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message.red));
      }

      callback(err);

    });

  });

}

function addConfigClients(cid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return next(new errors.InternalError(err.message.red));
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { clients: cid } }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message.red));
      }

      callback(err);

    });

  });

}

function getConfig(callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return next(new errors.InternalError(err.message.red));
    }

    Config.findOne({ cid: mc.currentconfig }, function(err, doc){

      if(err){
        Bunyan.conclude("ERROR: ".red + err.message.gray);
        return next(new errors.InternalError(err.message.red));
      }

      callback(err, doc);

    });

  });

}

function checkSetup(callback){

  MainConf.findOne({ blip: 1 }, function(err, doc) {
    if(err){
      Bunyan.conclude("ERROR: ".red + err.message.gray);
      return next(new errors.InternalError(err.message.red));
    }

    Bunyan.log('node-godwatch by Samusoidal', 10);
    Bunyan.log('https://www.github.com/samusoidal/node-godwatch/', 10);
    Bunyan.log(`Provided to you with an MIT License

Copyright (c) 2018 Samusoidal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`, 10);

    Bunyan.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n".gray, 10);

    if(doc == null){ //does not exist

      Bunyan.log('No configuration found, running config...\n'.yellow, 10);
      var userName = prompt.question('----------    '.gray + 'Username: ');
      var passWord = prompt.question('----------    '.gray + 'Password: ', { hideEchoBack: true });
      var passWord2 = prompt.question('----------    '.gray + 'Confirm Password: ', { hideEchoBack: true });

      while(passWord != passWord2){
        Bunyan.log('----------    '.gray + 'Passwords do not match, try again'.red, 10);
        var passWord = prompt.question('----------    '.gray + 'Password: ', { hideEchoBack: true });
        var passWord2 = prompt.question('----------    '.gray + 'Confirm Password: ', { hideEchoBack: true });
      }

      let newMConf = new MainConf(
        {
          blip: 1,
          username: userName,
          password: passWord,
          //currentconfig: 0
        }
      );

      Bunyan.log('\nRunning default email config...\n'.yellow, 10);

      var inMailhost = "";
      var inMailport = "";
      inMailhost = prompt.question('----------    '.gray + 'Email Server: ');
      inMailport = prompt.question('----------    '.gray + 'Email Port: ');

      var boolval = true;

      var inSecuremail = "";
      while(typeof inSecuremail != typeof boolval){
        inSecuremail = prompt.question('----------    '.gray + 'SSL/TLS (y/n): ');
        if(inSecuremail == "y"){
          inSecuremail = true;
        } else if(inSecuremail == "n") {
          inSecuremail = false;
        }
      }

      var inMailuser = "";
      var inMailpass = "";
      inMailuser = prompt.question('----------    '.gray + 'Email Address: ');
      inMailpass = prompt.question('----------    '.gray + 'Email Password: ', { hideEchoBack: true });

      var inMailRejectUnauthorized = "";

      Bunyan.log('----------    Disable the following to ignore certificate errors when sending notifications'.gray, 10);

      while(typeof inMailRejectUnauthorized != typeof boolval){
        inMailRejectUnauthorized = prompt.question('----------    '.gray + 'MailRejectUnauthorized (y/n): ');
        if(inMailRejectUnauthorized == "y"){
          inMailRejectUnauthorized = true;
        } else if(inMailRejectUnauthorized == "n") {
          inMailRejectUnauthorized = false;
        }
      }

      let newConf = new Config(
        {
          reporting: false,
          clientversion: 0.1,
          mailhost: inMailhost,
          mailport: inMailport,
          securemail: inSecuremail,
          mailuser: inMailuser,
          mailpass: inMailpass,
          mailRejectUnauthorized: inMailRejectUnauthorized,
        }
      );

      newConf.save(function(err){

        if(err){
          Bunyan.conclude("ERROR: ".red + err.message.gray);
          return next(new errors.InternalError(err.message.red));
        }

        newMConf.currentconfig = newConf.cid;

        newMConf.save(function(err){

          Bunyan.log("\nConfiguration set, please note username and password below as they will not be shown again.\n".yellow);
          Bunyan.log(("  Username: " + newMConf.username).green);
          Bunyan.log(("  Password: " + newMConf.password).green);
          Bunyan.log("\n");

          /*
          var exec = require('child_process').exec;
          exec("rs\r\n", function () {
            if (err) {
              Bunyan.log(`exec error: ${err}`);
              return;
            }
            Bunyan.log("Restarting server...");
            //process.exit(0)
          });
          */

          callback(null);

        });

      });

    } else {
      callback(null);
    }

  });

}

module.exports = {addConfigRecipients, removeConfigRecipients, addConfigClients, removeConfigClients, getConfig, checkSetup}
