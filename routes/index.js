// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const qs = require('qs');

const Config = require('../models/configuration');

//Nodules
const innerAuth = require('../nodule/inner-auth');
const sysMail = require('../nodule/sys-mail');

module.exports = function(server) {

  server.get('/', restify.serveStatic({
      directory:'./static/home',
      default: '/index.html'
  }));

  server.get('/*', restify.serveStatic({
      directory:'./static/home',
      default: '/index.html'
  }));

  server.get('/setup', function(req, res, next){
    res.redirect(req.path()+"/",next)
  });

  server.get('/setup/', restify.serveStatic({
      directory:'./static',
      default: '/index.html'
  }));

  server.get('/setup/*', restify.serveStatic({
      directory:'./static',
      default: '/index.html'
  }));

  server.post('/setup/', (req, res, next) => {

    if(!req.is('application/x-www-form-urlencoded')){
      return next(
        new errors.InvalidContentError("Expects 'application/x-www-form-urlencoded'")
      );
    }

    let data = qs.parse(req.body) || {};

    let newConfig = new Config(data);
    newConfig.reporting = false;
    newConfig.save(function(err){

      if(err){
        console.error(err);
        return next(new errors.InternalError(err.message));
        next();
      }

      res.send(201, newConfig);
      next();

    });

  });

  // LIST
  server.get('/config', (req, res, next) => {
    Config.apiQuery(req.params, function(err, docs){
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(docs);
      next();
    });
  });

};
