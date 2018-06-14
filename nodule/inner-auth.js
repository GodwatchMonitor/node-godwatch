const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const prompt = require('readline-sync');

const sysMail = require('../nodule/sys-mail');
const Bunyan = require('../nodule/bunyan');

const autoIncrement = require('mongoose-auto-increment');
const MainConf = require('../models/mainconf');
const Config = require('../models/configuration');

function checkAdminPassword(password, username, cb){

  MainConf.findOne({ blip: 1 }, function(err, doc) {
    if(err){
      Bunyan.error(err);
      return next(
        new errors.InvalidContentError(err)
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
      Bunyan.error(err);
      return next(
        new errors.InvalidContentError(err)
      );
    }
    if(doc != null){
      UserPassword.findOne( {userid: doc.userid}, function(err, pwd){
        if(err) {
          Bunyan.error(err);
          return next(
            new errors.InvalidContentError(err)
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

module.exports = {userAuth, adminAuth}
