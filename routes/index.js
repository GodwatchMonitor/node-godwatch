// Dependencies
const errors = require('restify-errors');
const restify = require('restify-plugins');
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const qs = require('qs');

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

};
