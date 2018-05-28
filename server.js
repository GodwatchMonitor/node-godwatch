// Dependencies
const config = require('./config');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const restifyCookies = require('restify-cookies');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
const fs = require('fs');
const figlet = require('figlet');
const route66 = require('./nodule/route-66');
const innerAuth = require('./nodule/inner-auth');

const colors = require('colors');
const timestamp = require('console-timestamp');

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

figlet.text('node-godwatch', {
    font: 'Doom',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}, function(err, data) {
    if (err) {
        console.log('Something went wrong...'.red);
        console.dir(err);
        return;
    }
    console.log(data.green);
    console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n".gray);

});

// Start Server, Connect to DB and Require Routes
server.listen(config.port, () => {

  console.log('\033c');

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

    innerAuth.checkSetup(function(err){

      if(!err){

        console.log('[MM-DD-YY] hh:mm    '.timestamp + 'Server is listening on port ' + config.port);

        secureserver.listen(config.secureport, () => {
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
            console.log('[MM-DD-YY] hh:mm    '.timestamp + 'Secure Server is listening on port ' + config.secureport);
          });

        });

      }

    });

  });

});
