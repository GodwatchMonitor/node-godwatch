function initializeRoutes(server){
  require('../routes');
  require('console-stamp')(console, '[HH:MM:ss.l]');
}

module.exports = {initializeRoutes}
