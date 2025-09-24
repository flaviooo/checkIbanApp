const mongoose = require('mongoose');

const AccountHolderSchema = new mongoose.Schema({
  type: String,
  vatCode: String,
  fiscalCode: String,
  taxCode: String
}, { _id: false });

const AccountSchema = new mongoose.Schema({
  value: String,
  valueType: String,
  bicCode: String
}, { _id: false });

const AnagraficaInfoSchema = new mongoose.Schema({
  requestCode: String,
  ragioneSociale: String,
  riferimentoLegale: String,
  codiceFiscaleRapp: String
}, { _id: false });

const RequestListItemSchema = new mongoose.Schema({
  requestCode: String,
  anagraficaInfo: AnagraficaInfoSchema,
  account: AccountSchema,
  accountHolder: AccountHolderSchema
}, { _id: false });

const RequestSchema = new mongoose.Schema({
  account: AccountSchema,
  accountHolder: AccountHolderSchema,
  list: [RequestListItemSchema]
}, { _id: false });

const BankInfoSchema = new mongoose.Schema({
  businessName: String,
  city: String,
  countryCode: String,
  bicCode: String,
  branchName: String
}, { _id: false });

const ResponsePayloadSchema = new mongoose.Schema({
  validationStatus: String,
  account: AccountSchema,
  accountHolder: AccountHolderSchema,
  bankInfo: BankInfoSchema
}, { _id: false });

const ResponseListItemSchema = new mongoose.Schema({
  requestCode: String,
  anagraficaInfo: AnagraficaInfoSchema,
  account: AccountSchema,
  accountHolder: AccountHolderSchema,
  validationStatus: String,
  error: mongoose.Schema.Types.Mixed,
  bankInfo: BankInfoSchema,
  requestId: String
}, { _id: false });

const ResponseSchema = new mongoose.Schema({
  status: String,
  errors: [mongoose.Schema.Types.Mixed],
  payload: ResponsePayloadSchema,
  bulkRequestId: String,
  bulkRequestStatus: String,
  completedDatetime: String,
  processedItemsCount: Number,
  totalItemsCount: Number,
  list: [ResponseListItemSchema],
  warnings: mongoose.Schema.Types.Mixed
}, { _id: false });

const CheckIbanSchema = new mongoose.Schema({
  request: RequestSchema,
  tipoChiamata: String,
  timestamp: Date,
  __v: Number,
  response: ResponseSchema
}, { collection: 'checkIbanColl' });

module.exports = mongoose.model('ibanLogImport', CheckIbanSchema);