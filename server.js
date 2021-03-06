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
const Reporting = require('./nodule/reporting');
const SysMail = require('./nodule/sys-mail');
const Configurate = require('./nodule/configurate');
const Bunyan = require('./nodule/bunyan');
const ps = require('ps-node');
const child_process = require('child_process');

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

Bunyan.init();
serverStarted = false;

console.log("Killing all instances of mongod...");
ps.lookup({command: 'mongod'}, (err, results) => {
  if(err){
    console.log("oops");
  }
  if(results.length > 1){
    results.forEach(function(process){
      if(process){
        ps.kill(process.pid, function(err){
          if(err){
              console.log("oops");
          } else {
              console.log('Process has been killed!');
              start_mongodb();
          }
        });
      }
    });
  } else {
    start_mongodb();
  }
});

function start_mongodb(){
  console.log("Starting mongod with path " + __dirname + "/db");
  child_process.exec('mongod --dbpath ' + __dirname + '/db', (e, out, err) => {
    if(e){
      return;
    }
  });

  setTimeout(start_server, 5000);
}

function start_server(){

  serverStarted = true;

  figlet.text('node-godwatch', {
      font: 'Doom',
      horizontalLayout: 'default',
      verticalLayout: 'default'
  }, function(err, data) {
      if (err) {
          Bunyan.log('Something went wrong...'.red, 0);
          console.dir(err);
          return;
      }
      Bunyan.log(data.green, 10);
      Bunyan.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n".gray, 10);

  });

  // Start Server, Connect to DB and Require Routes
  server.listen(config.port, () => {

    Bunyan.log('\033c', 10);

    //connect to mongodb
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db.uri);
    autoIncrement.initialize(mongoose.connection);

    const db = mongoose.connection;

    db.on('error', (err) => {
      Bunyan.error(err);
      process.exit(1);
    });

    db.once('open', () => {

      route66.initializeRoutes(server);

      Configurate.checkSetup(function(err){

        if(!err){

          Bunyan.notify('Server is listening on port ' + config.port, 0);

          Reporting.initialize();

          Configurate.getConfig((err, config) => {
            server.config = config;
          });

        }

      });

    });

  });
}
