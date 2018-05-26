const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const prompt = require('readline-sync');

const MainConf = require('../models/mainconf');

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

    if(doc == null){ //does not exist

      console.log('No configuration found, running config...\n');
      var userName = prompt.question('----------------------     Username: ');
      var passWord = prompt.question('----------------------     Password: ', { hideEchoBack: true });
      var passWord2 = prompt.question('----------------------     Confirm Password: ', { hideEchoBack: true });

      while(passWord != passWord2){
        console.log("----------------------     Passwords do not match, try again");
        var passWord = prompt.question('----------------------     Password: ', { hideEchoBack: true });
        var passWord2 = prompt.question('----------------------     Confirm Password: ', { hideEchoBack: true });
      }

      let newMConf = new MainConf(
        {
          blip: 1,
          username: userName,
          password: passWord
        }
      );

      newMConf.save(function(err){

        if(err){
          console.error(err);
          return next(new errors.InternalError(err.message));
          next();
        }

        console.log("Configuration set, please note username and password below as they will not be shown again.");
        console.log(newMConf);

        cb(null);
        
      });

    } else {
      cb(null);
    }

  });

}

module.exports = {userAuth, adminAuth, checkSetup}
