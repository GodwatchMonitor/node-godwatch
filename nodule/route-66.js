function initializeRoutes(server){
  require('../routes/main.js')(server);
  require('../routes/config.js')(server);
  require('../routes/recipient.js')(server);
  require('../routes/client.js')(server);
  //require('console-stamp')(console, '[HH:MM:ss.l]');
}

module.exports = {initializeRoutes}
