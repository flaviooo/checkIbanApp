require('dotenv').config();  // carica .env in process.env
const config = require('config');

module.exports = {
  NODE_ENV: process.env.NODE_ENV,

  dbUser: process.env.USER_DB,
  dbHost: process.env.HOST_DB,
  dbPassword: process.env.PASSWORD_DB,
  dbName: process.env.NAME_DB,
  
  dbQuery: config.get('db.query'),
  nameApp: config.get('app.nameApp'),
  port: config.get('app.port'),
  apiKey: process.env.API_KEY,
  urlMassive: config.get('services.urlMassive'),
  urlSingle: config.get('services.urlSingle'),
  authSchema: config.get('services.authSchema'),
  
};
