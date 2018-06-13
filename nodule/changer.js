const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');

const colors = require('colors');
const timestamp = require('console-timestamp');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');
const Client = require('../models/client');

function removeConfigRecipients(rid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $pull: { recipients: rid } }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      callback(err);

    });

  });

}

function addConfigRecipients(rid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { recipients: rid } }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      callback(err);

    });

  });

}

function removeConfigClients(cid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $pull: { clients: cid } }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      callback(err);

    });

  });

}

function addConfigClients(cid, callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Config.findOneAndUpdate({ cid: mc.currentconfig }, { $push: { clients: cid } }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      callback(err);

    });

  });

}

function getConfig(callback){

  MainConf.findOne({ blip: 1 }, function(err, mc){

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Config.findOne({ cid: mc.currentconfig }, function(err, doc){

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      callback(err, doc);

    });

  });

}

module.exports = {addConfigRecipients, removeConfigRecipients, addConfigClients, removeConfigClients, getConfig}
