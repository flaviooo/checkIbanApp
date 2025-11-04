require('dotenv').config();  // carica .env in process.env
const fs = require('fs');
const mysql = require('mysql');
const config = require('config');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

console.log("------------------ " + process.env.NODE_APP_INSTANCE);

// 🔹 Configurazione base applicativa
const baseConfig = {
  NODE_ENV: process.env.NODE_ENV,
  NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE,

  limitQuery: config.get('db.limitQuery'),
  dbMongoHost: process.env.HOST_MONGODB,
  dbMongoName: process.env.NAME_MONGODB,
  nameApp: config.get('app.nameApp'),

  dbUser: process.env.USER_DB,
  dbHost: process.env.HOST_DB,
  dbPassword: process.env.PASSWORD_DB,
  dbName: process.env.NAME_DB,
  dbQueryFile: fs.readFileSync(config.get('db.queryFile') || './config/queries/collaudo_query.sql', 'utf8'),
  dbQueryFileWithCondition: fs.readFileSync(config.get('db.queryFileCondition') || ' ', 'utf8'),

  port: config.get('app.port'),
  apiKey: process.env.API_KEY,
  urlMassive: config.get('services.urlMassive'),
  urlSingle: config.get('services.urlSingle'),
  authSchema: config.get('services.authSchema'),

  headers: {
    "Content-Type": "application/json",
    "Auth-Schema": "S2S",
    "Api-Key": process.env.API_KEY
  },

  pool: mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    connectionLimit: 10
  }),
};

// 🔹 Configurazione Swagger
const host = process.env.HOST || 'http://localhost';
const port = config.get('app.port') || 3000;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API CSEA',
    version: '1.0.0',
    description: 'Documentazione automatica delle API Express',
  },
  servers: [
    {
      url: `${host}:${port}`,
      description: 'Server locale di sviluppo',
    },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/**/*.js'], // percorsi dove hai messo i commenti @openapi
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 🔹 Esporta tutto
module.exports = {
  ...baseConfig,
  swaggerUi,
  swaggerSpec
};
