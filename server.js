// Dependencies
const config = require('./config');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const restifyCookies = require('restify-cookies');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const fs = require('fs');
const route66 = require('./nodule/route-66');

// Init Server
const server = restify.createServer({
  name: config.name,
  version: config.version,
  //handleUncaughtExceptions: true,
  //key: fs.readFileSync('../ssl/server.key'),
  //certificate: fs.readFileSync('../ssl/server.crt')
});
const secureserver = restify.createServer({
  name: config.name,
  version: config.version,
  //handleUncaughtExceptions: true,
  //key: fs.readFileSync('../ssl/server.key'),
  //certificate: fs.readFileSync('../ssl/server.crt')
});

// Middleware
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
server.use(restifyPlugins.authorizationParser());

secureserver.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
secureserver.use(restifyPlugins.acceptParser(server.acceptable));
secureserver.use(restifyPlugins.queryParser({ mapParams: true }));
secureserver.use(restifyPlugins.fullResponse());
secureserver.use(restifyPlugins.authorizationParser());

// Start Server, Connect to DB and Require Routes
server.listen(config.port, () => {
  //connect to mongodb
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db.uri);
  autoIncrement.initialize(mongoose.connection);

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  db.once('open', () => {
    route66.initializeRoutes(server);
    console.log('Server is listening on port 7001');
  });

});

secureserver.listen('7002', () => {
  //connect to mongodb
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db.uri);
  autoIncrement.initialize(mongoose.connection);

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  db.once('open', () => {
    route66.initializeRoutes(secureserver);
    console.log('Secure Server is listening on port 7002');
  });

});
