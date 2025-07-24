const mongoose = require('mongoose');

const logSchemaMassiva = new mongoose.Schema({
  requestCode: String,
  request: Object,
  response: Object,
   tipoChiamata: { type: String, default: "Massiva" },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'checkIbanColl' });


const logSchemaSingle = new mongoose.Schema({
  request: Object,
  response: Object,
   tipoChiamata: { type: String, default: "Singola" },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'checkIbanColl' });

const IbanLogMassive = mongoose.model('IbanLogMassive', logSchemaMassiva);
const IbanLogSingle = mongoose.model('IbanLogSingle', logSchemaSingle);

module.exports = { IbanLogMassive, IbanLogSingle };