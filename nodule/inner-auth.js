const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');

const User = require('../models/user.js');
const UserPassword = require('../models/password.js');

function checkAdminPassword(password, username, cb){
  if(password == "badN!ght45" && username == "supercat70"){
    cb(false);
  } else {
    cb(true);
  }
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

module.exports = {userAuth, adminAuth}
