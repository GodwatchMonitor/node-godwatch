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

  // LIST
  server.get('/config', innerAuth.adminAuth, (req, res, next) => {
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

  // GET SINGLE
  server.get('/config/:cid', innerAuth.adminAuth, (req, res, next) => {
    Config.findOne({ cid: req.params.cid }, function(err, doc) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(doc);
      next();
    });
  });

  server.del('/config/:cid', innerAuth.adminAuth, (req, res, next) => {
    Config.remove({ cid: req.params.cid }, function(err) {
      if(err){
        console.error(err);
        return next(
          new errors.InvalidContentError(err.errors.name.message)
        );
      }

      res.send(204);
      next();
    });
  });

};
