require('dotenv').config();  // carica .env in process.env
const config = require('config');

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  port: config.get('app.port'),
  apiKey: process.env.API_KEY,
  dbPassword: process.env.PASSWORD_DB,
  urlMassive: config.get('services.urlMassive'),
  urlSingle: config.get('services.urlSingle'),
  authSchema: config.get('services.authSchema'),
  dbQuery: config.get('db.query')
};
