require('dotenv').config();  // carica .env in process.env
const mysql = require('mysql');
const config = require('config');

// ✅ Crea un pool riutilizzabile
module.exports = {
  
  NODE_ENV: process.env.NODE_ENV,
  
  limitQuery: config.get('db.limitQuery'),
  dbMongoHost : process.env.HOST_MONGODB,
  dbMongoName : process.env.NAME_MONGODB,
  nameApp: config.get('app.nameApp'),
  dbUser: process.env.USER_DB,
  dbHost: process.env.HOST_DB,
  dbPassword: process.env.PASSWORD_DB,
  dbName: process.env.NAME_DB,
  dbQuery: config.get('db.query'),
  
  port: config.get('app.port'),
  apiKey: process.env.API_KEY,
  urlMassive: config.get('services.urlMassive'),
  urlSingle: config.get('services.urlSingle'),
  authSchema: config.get('services.authSchema'),
  pool : mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    connectionLimit: 10 // facoltativo, default è 10
}),
  

  
};
