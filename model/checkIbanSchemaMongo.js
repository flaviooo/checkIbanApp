const cfg = require('./../config');
const mongoose = require('mongoose');

const logSchemaMassiva = new mongoose.Schema({
  requestCode: String,
  request: Object,
  response: Object,
   tipoChiamata: { type: String, default: "Massiva" },
  timestamp: { type: Date, default: Date.now }
}, { collection: cfg.dbMongoName });


const logSchemaSingle = new mongoose.Schema({
  request: Object,
  response: Object,
   tipoChiamata: { type: String, default: "Singola" },
  timestamp: { type: Date, default: Date.now }
}, { collection: cfg.dbMongoName });

const IbanLogMassive = mongoose.model('IbanLogMassive', logSchemaMassiva);
const IbanLogSingle = mongoose.model('IbanLogSingle', logSchemaSingle);

module.exports = { IbanLogMassive, IbanLogSingle };