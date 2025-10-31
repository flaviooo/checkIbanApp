require('dotenv').config();  // carica .env in process.env
const fs = require('fs');
const mysql = require('mysql');
const config = require('config');

console.log("------------------"+process.env.NODE_APP_INSTANCE);

// ✅ Crea un pool riutilizzabile
module.exports = {
  
  NODE_ENV: process.env.NODE_ENV,
  NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE,  
  
  limitQuery: config.get('db.limitQuery'),
  dbMongoHost : process.env.HOST_MONGODB,
  dbMongoName : process.env.NAME_MONGODB,
  nameApp: config.get('app.nameApp'),
  dbUser: process.env.USER_DB,
  dbHost: process.env.HOST_DB,
  dbPassword: process.env.PASSWORD_DB,
  dbName: process.env.NAME_DB,
  dbQueryFile: fs.readFileSync( config.get('db.queryFile') || './config/queries/collaudo_query.sql', 'utf8'), 
  dbQueryFileWithCondition: fs.readFileSync( config.get('db.queryFileCondition') || ' ', 'utf8'), 

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
