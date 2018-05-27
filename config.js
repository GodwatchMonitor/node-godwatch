module.exports = {
  name: 'node-godwatch',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '7001',
  secureport: '7002',
  //base_url: process.env.BASE_URL || 'http://192.168.1.62:7001',
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api',
  },
};
