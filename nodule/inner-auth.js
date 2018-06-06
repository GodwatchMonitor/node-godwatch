const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const prompt = require('readline-sync');

const sysMail = require('../nodule/sys-mail');

const autoIncrement = require('mongoose-auto-increment');
const MainConf = require('../models/mainconf');
const Config = require('../models/configuration');

function checkAdminPassword(password, username, cb){

  MainConf.findOne({ blip: 1 }, function(err, doc) {
    if(err){
      console.error(err);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    }

    if(doc != null){ //does exist
      if(password == doc.password && username == doc.username){
        cb(false);
      } else {
        cb(true);
      }
    } else {
      cb(true);
    }

  });

}

const userAuth = function(req, res, next){

  res.header('WWW-Authenticate','Basic realm="API Docs"');

  if (
    !req.authorization ||
    !req.authorization.basic ||
    !req.authorization.basic.password
  ){
    res.redirect("https://api.samusoidal.com:7002/register/", next)
    return next(false);
  }

  c_user = req.authorization.basic.username;
  c_pass = req.authorization.basic.password;

  User.findOne({ usernameplain: c_user }, function(err, doc){

    if(err) {
      console.error(err);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    }
    if(doc != null){
      UserPassword.findOne( {userid: doc.userid}, function(err, pwd){
        if(err) {
          console.error(err);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        if(c_pass === pwd.key){
          return next();
        } else {
          res.send(401);
          return next(false);
        }

      });
    } else {
      res.send(401);
      return next(false);
    }

  });

}

const adminAuth = function(req, res, next){
  res.header('WWW-Authenticate','Basic realm="API Docs"');

  if (
    !req.authorization ||
    !req.authorization.basic ||
    !req.authorization.basic.password
  ){
    res.send(401);
    return next(false);
  }

  checkAdminPassword(req.authorization.basic.password, req.authorization.basic.username, function(err,data){
    if (err){
      res.send(401);
      return next(false);
    }
    else return next();
  });
};

const checkSetup = function(cb){

  MainConf.findOne({ blip: 1 }, function(err, doc) {
    if(err){
      console.error(err);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    }

    console.log('node-godwatch by Samusoidal');
    console.log('https://www.github.com/samusoidal/node-godwatch/');
    console.log(`Provided to you with an MIT License

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
`);

    console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n".gray);

    if(doc == null){ //does not exist

      console.log('No configuration found, running config...\n'.yellow);
      var userName = prompt.question('----------    '.gray + 'Username: ');
      var passWord = prompt.question('----------    '.gray + 'Password: ', { hideEchoBack: true });
      var passWord2 = prompt.question('----------    '.gray + 'Confirm Password: ', { hideEchoBack: true });

      while(passWord != passWord2){
        console.log('----------    '.gray + 'Passwords do not match, try again'.red);
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

      console.log('\nRunning default email config...\n'.yellow);

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

      console.log('----------    Disable the following to ignore certificate errors when sending notifications'.gray);

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
          console.error(err);
          return next(new errors.InternalError(err.message.red));
          next();
        }

        newMConf.currentconfig = newConf.cid;

        newMConf.save(function(err){

          console.log("\nConfiguration set, please note username and password below as they will not be shown again.\n".yellow);
          console.log(("  Username: " + newMConf.username).green);
          console.log(("  Password: " + newMConf.password).green);
          console.log("\n");

          /*
          var exec = require('child_process').exec;
          exec("rs\r\n", function () {
            if (err) {
              console.log(`exec error: ${err}`);
              return;
            }
            console.log("Restarting server...");
            //process.exit(0)
          });
          */

          cb(null);

        });

      });

    } else {
      cb(null);
    }

  });

}

module.exports = {userAuth, adminAuth, checkSetup}
