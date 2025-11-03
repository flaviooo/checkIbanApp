const express = require('express');
const cfg = require('./../config');
const router = express.Router();
const checkIbanModel = require('../model/checkIbanModel');
const axios = require('axios');
const https = require('https');
const { IbanLogSingle, IbanLogMassive } = require('../model/checkIbanSchemaMongo');
const { ibanLogImport } = require('../model/checkIbanSchemaMongoImport');
const utility = require('./../utilities/utility');
const massiveUrl = cfg.urlMassive;
const headers = cfg.headers;

router.get('/checkIbanMongoPage', async function (req, res) {
  try {
    const pending = await IbanLogMassive.find(
      { "response.bulkRequestId": { $exists: true, $ne: null }, "response.bulkRequestStatus": "PENDING" });
    // Ottieni lista unica dei bulkRequestId
    const bulkRequestIdListP = [...new Set(pending.map(doc => doc.response.bulkRequestId))];
    console.log(`✅ Trovati ${bulkRequestIdListP.length} bulkRequestId`);

    const completed = await IbanLogMassive.find(
      { "response.bulkRequestId": { $exists: true, $ne: null }, "response.bulkRequestStatus": "COMPLETED" });
    // Estrai solo gli ID univoci per eventuale uso separato
    const bulkRequestIdListC = [...new Set(completed.map(doc => doc.response.bulkRequestId))];
   // console.log(`✅ Trovati ${bulkRequestIdListC.length} bulkRequestId`);
    
   const allListsCombined = completed.flatMap(doc => doc.response?.list || []);
 
  const allListsCombinedP = pending.flatMap(doc =>doc.response?.list || []);
  const allListsCombinedPCount = allListsCombinedP.length;
  //console.log(`✅ Trovati ${allListsCombinedPCount} documenti in stato PENDING`);
    res.render('checkIbanVerificaMongo', {
      title: "Check IBAN Massivi Mongo",
      bulkRequestIdListP: bulkRequestIdListP || 'N/A',
      bulkRequestIdListC: bulkRequestIdListC || 'N/A',
      result: allListsCombined,
      allListsCombinedPCount : allListsCombinedPCount,
      allListsCombinedP:allListsCombinedP
    });

  } catch (error) {
    console.error("❌ Errore:", error.message);
    if (error.response) {
      console.error("❌ Dettagli:", error.response.status, error.response.data);
    }
    res.status(500).send("Errore durante la verifica massiva degli IBAN.");
  }
});


router.get('/checkIbanMongo', async function (req, res) {
  try {
    // Recupera gli IBAN dalla collezione IbanLogMassive
    const resultsIban = await IbanLogMassive.aggregate([
      { $match: { "response.bulkRequestStatus": "COMPLETED" } },
      { $unwind: "$request.list" },
      { $project: { iban: "$request.list.account.value", _id: 0 } }
    ]);

    // la lista pulita degli IBAN
    const ibanList = resultsIban.map(doc => doc.iban);
    const bodyObj = await checkIbanModel.getInfoAnagraficaFiltered(ibanList);

    // Salvataggio della richiesta su MongoDB
    const logEntry = new IbanLogMassive({ request: bodyObj });
    const saved = await logEntry.save();
    console.log(`✅ Richiesta salvata con ID: ${saved._id}`);
    // Esegui chiamata al servizio massivo
   /*  const axiosResponse = await axios.post(cfg.urlMassive, { list: cleanedRequestList }, {
      headers, httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    // Estrai dati dalla risposta
    const payload = axiosResponse.data?.payload || {};
    const ibr = await IbanLogMassive.findByIdAndUpdate(saved._id, { response: payload });
    console.log(`✅ Risposta aggiornata per bulkRequestId: ${ibr._id}`);
 */
const completed = await IbanLogMassive.find(
      { "response.bulkRequestId": { $exists: true, $ne: null }, "response.bulkRequestStatus": "COMPLETED" });
    // Estrai solo gli ID univoci per eventuale uso separato
    const bulkRequestIdListC = [...new Set(completed.map(doc => doc.response.bulkRequestId))];
   // console.log(`✅ Trovati ${bulkRequestIdListC.length} bulkRequestId`);
    const allListsCombined = completed.flatMap(doc => doc.response?.list || []);

  //  const result = utility.mergeByRequestCode(bodyObj, response.data);
    res.render('checkIbanVerificaMongo', {
      title: "Check IBAN Massivi Mongo",
      result: allListsCombined || 'N/A'
    });
  } catch (error) {
    console.error("❌ Errore:", error.message);
    if (error.response) {
      console.error("❌ Dettagli:", error.response.status, error.response.data);
    }
    res.status(500).send("Errore durante la verifica massiva degli IBAN. " + error.code);
  }
});

//FIXME: da sistemare reder
// Rotta per la verifica massiva

router.get('/massive', async function (req, res) {
  try {
    // Ottieni lista input con anagrafica
    const bodyObj = await checkIbanModel.getInfoAnagrafica();
    // Pulisci per invio: rimuovi campo anagraficaInfo prima della chiamata remota

    // Salvataggio della richiesta su MongoDB
    const logEntry = new IbanLogMassive({ request: bodyObj });
    const saved = await logEntry.save();
    console.log(`✅ Richiesta salvata con ID: ${saved._id}`);

    const cleanedRequestList = bodyObj.list.map(({ anagraficaInfo, ...rest }) => rest);
    // Esegui chiamata al servizio massivo
    const axiosResponse = await axios.post(massiveUrl, { list: cleanedRequestList }, {
      headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    // Estrai dati dalla risposta
    const payload = axiosResponse.data?.payload || {};
    const responseList = payload.list || [];

    // Unisci input originale (con anagraficaInfo) con output del servizio
    const enrichedList = utility.mergeInputWithResponse(bodyObj.list, responseList); // DEVE usare requestCode
    // Aggiorna il log con la risposta
    const ibr = await IbanLogMassive.findByIdAndUpdate(saved._id, { response: payload });
    console.log(`✅ Risposta salvata per ID su MongoDB: ${saved._id}`);
    //console.log(`✅ Log aggiornato con ID: ${JSON.stringify(saved._id, null, 2)}`);

    console.log("✅ ENRICHED LIST:", JSON.stringify(enrichedList, null, 2));
    // Renderizza la pagina con i dati completi
    res.render('checkIbanViewMassive', {
      title: "Check IBAN Massivi",
      result: enrichedList, // deve essere un array
      status: axiosResponse.data?.status || 'N/A',
      totalItems: payload.totalItemsCount || enrichedList.length,
      bulkRequestId: payload.bulkRequestId || 'N/A'
    });
  } catch (error) {
    console.error("❌ Errore:", error.message);
    if (error.response) {
      console.error("❌ Dettagli:", error.response.status, error.response.data);
    }
    res.status(500).send("Errore durante la verifica massiva degli IBAN. " + error.code);
  }
});

//FIXME : reder da sistemare

router.get('/massiveUnique', async function (req, res) {
  try {
    // Ottieni lista input con anagrafica
    const bodyObj = await checkIbanModel.getInfoAnagrafica();
    //Estrai tutti gli IBAN dalla richiesta
    const ibanList = bodyObj.list.map(item => item.account?.value).filter(Boolean);
    // Cerca tutti gli IBAN già presenti nel DB
    const existingDocs = await IbanLogMassive.find({'request.list.account.value': { $in: ibanList }}).lean();
    // Estrai IBAN già presenti
    const existingIbans = new Set();
    existingDocs.forEach(doc => {(doc.request?.list || []).forEach(entry => {if (entry.account?.value) existingIbans.add(entry.account.value);});});
    // Separa gli IBAN in nuovi e già presenti
    const nuovi = { list: [] };
    const presenti = { list: [] };
    bodyObj.list.forEach(entry => {
    const iban = entry.account?.value;
    if (!iban) return;
    if (existingIbans.has(iban)) { presenti.list.push(entry); } else { nuovi.list.push(entry);
  }
});

    // Salva su file
   // fs.writeFileSync(path.join(__dirname, '../test/iban_nuovi.json'), JSON.stringify(nuovi, null, 2));
   // fs.writeFileSync(path.join(__dirname, '../test/iban_presenti.json'), JSON.stringify(presenti, null, 2));

    console.log(`✅ ${nuovi.length} IBAN nuovi salvati in iban_nuovi.json`);
    console.log(`✅ ${presenti.length} IBAN già presenti salvati in iban_presenti.json`);
    // Salvataggio della richiesta su MongoDB
    const logEntry = new IbanLogMassive({ request: bodyObj });
    const saved = await logEntry.save();
    console.log(`✅ Richiesta salvata con ID: ${saved._id}`);
    const cleanedRequestList2 = nuovi.list.map(({ anagraficaInfo, ...rest }) => rest);
    if (nuovi.length !== 0) {
      // Esegui chiamata al servizio massivo
      const axiosResponse = await axios.post(massiveUrl, { list: cleanedRequestList2 }, {
        headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
    }
    // Estrai dati dalla risposta
    const payload = axiosResponse.data?.payload || {};
    const responseList = payload.list || [];

    // Aggiorna il log con la risposta
    const ibr = await IbanLogMassive.findByIdAndUpdate(saved._id, { response: payload });
    console.log(`✅ Risposta salvata per ID su MongoDB: ${saved._id}`);
    console.log(`✅ Log aggiornato con ID: ${JSON.stringify(saved._id, null, 2)}`);

    console.log("✅ ENRICHED LIST:", JSON.stringify(enrichedList, null, 2));
    // Renderizza la pagina con i dati completi
    res.render('checkIbanViewMassive', {
      title: "Check IBAN Massivi Uniques",
      result: enrichedList, // deve essere un array
      status: axiosResponse.data?.status || 'N/A',
      totalItems: payload.totalItemsCount || enrichedList.length,
      bulkRequestId: payload.bulkRequestId || 'N/A'
    });
  } catch (error) {
    console.error("❌ Errore:", error.message);
    if (error.response) {
      console.error("❌ Dettagli:", error.response.status, error.response.data);
    }
    res.status(500).send("Errore durante la verifica massiva degli IBAN. " + error.code);
  }
});

module.exports = router;
