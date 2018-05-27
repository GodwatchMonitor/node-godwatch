function initializeRoutes(server){
  require('../routes')(server);
  //require('console-stamp')(console, '[HH:MM:ss.l]');
}

module.exports = {initializeRoutes}
