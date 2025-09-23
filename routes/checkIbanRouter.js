const express = require('express');
const cfg = require('./../config');
const router = express.Router();
const { IbanLog, IbanLogSingle, IbanLogMassive } = require('../model/checkIbanSchemaMongo');
const checkIbanModel = require('../model/checkIbanModel');
const axios = require('axios');
const https = require('https');

const apiKey = cfg.apiKey;
const authSchema = cfg.authSchema;
const massiveUrl = cfg.urlMassive;

const headers = {
  'Content-Type': 'application/json',
  'Auth-Schema': authSchema || 'S2S',
  'Api-Key': apiKey
};

// Rotta per visualizzare il form
router.get('/', async function (req, res) {
  try {
    res.render('index', { title: "Index IBAN Page" });
  } catch (error) {
    console.error("❌ Errore rendering form:", error.message);
    res.status(500).send("Errore nella visualizzazione del form.");
  }
});
router.get('/singlePage', async function (req, res) {
  try {
    res.render('checkIbanViewSingle', { title: "Check IBAN Page" });
  } catch (error) {
    console.error("❌ Errore rendering form:", error.message);
    res.status(500).send("Errore nella visualizzazione del form.");
  }
});

router.post('/single', async function (req, res) {
  const { iban, vatCode } = req.body;

   const bodyList = {
    account: {
      value: iban,
      valueType: "IBAN",
      bicCode: null
    },
    accountHolder: {
      type: "PERSON_LEGAL",
      vatCode,
      fiscalCode: null,
      taxCode: null
    }
  };

  try {
    // Salvataggio della richiesta su MongoDB
    const logEntry = new IbanLogSingle({ request: bodyList });
    const saved = await logEntry.save();
    console.log(`✅ Richiesta salvata con ID: ${saved._id}`);
    // Chiamata API (axios converte bodyList in JSON)
    const response = await axios.post(cfg.urlSingle, bodyList, { headers, httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    //console.log('📬 Risposta API:', response.data);
    // Aggiorna il log con la risposta
    const ibr = await IbanLogSingle.findByIdAndUpdate(saved._id, { response: response.data });
    console.log(`✅ Risposta salvata per ID su MongoDB: ${saved._id}`);
    console.log(`✅ Log aggiornato con ID: ${JSON.stringify(saved._id, null, 2)}`);
    // Risposta all'utente
    res.render('checkIbanViewSingle', {
      title: 'Verifica IBAN Singolo',
      result: response.data
    });

  } catch (error) {
    console.error("❌ Errore durante la verifica API o salvataggio:", error.message);
    if (error.response) {
      console.error("Dettagli errore API:", error.response.status, error.response.data);
    }
    if (error.request && !error.response) {
      console.error("Nessuna risposta ricevuta dall'API:", error.request);
    }

    // Risposta errore all'utente
    res.status(500).render('checkIbanViewSingle', {
      title: 'Errore Verifica',
      result: { error: 'Errore durante la verifica dell\'IBAN. Riprova più tardi.' }
    });
  }
});

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
    const enrichedList = mergeInputWithResponse(bodyObj.list, responseList); // DEVE usare requestCode
      // Aggiorna il log con la risposta
    const ibr = await IbanLogMassive.findByIdAndUpdate(saved._id, { response: payload });
    console.log(`✅ Risposta salvata per ID su MongoDB: ${saved._id}`);
    console.log(`✅ Log aggiornato con ID: ${JSON.stringify(saved._id, null, 2)}`);
  
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

router.get('/massiveVerificaPage', async function (req, res) {
  try {

    res.render('checkIbanVerificaMassive', {
      title: "Check IBAN Massivi",
      //        result: response
    });

  } catch (error) {
    console.error("❌ Errore:", error.message);
    if (error.response) {
      console.error("❌ Dettagli:", error.response.status, error.response.data);
    }
    res.status(500).send("Errore durante la verifica massiva degli IBAN.");
  }
});

router.post('/massiveVerifica', async function (req, res) {
  try {
    const { bulkRequestId } = req.body;

    const url = `${massiveUrl}/${bulkRequestId}`;
    //console.log("🔗 URL chiamata:", url);
    // Ottieni lista input con anagrafica
    const bodyObj = await checkIbanModel.getInfoAnagrafica();
    //  console.log("✅ Dati ricevuti: DB", bodyObj);
    const response = await axios.get(url, {
      headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // ⚠️ Solo in sandbox
    });
    console.log("✅ Dati ricevuti responseAxios:", response.data);
    const result = mergeByRequestCode(bodyObj, response.data);
// Cerca il record con bulkRequestId

const logRecord = await IbanLogMassive.findOne({ 'response.bulkRequestId': bulkRequestId });

if (logRecord) {
  // Aggiorna il record trovato
  const ibr = await IbanLogMassive.findByIdAndUpdate(logRecord._id, { response: result });
  console.log(`✅ Risposta aggiornata per bulkRequestId: ${bulkRequestId}`);
} else {
  console.warn(`⚠️ Nessun record trovato con bulkRequestId: ${bulkRequestId}`);
}

    console.log("✅ Dati Uniti:" + JSON.stringify(result, null, 2));

    res.render('checkIbanVerificaMassive', {
      title: "Check IBAN Massivi",
      result: result,
      flash: {
        error: 'Bulk Request Not Found', // o null
        info: null
      }
    });

  } catch (error) {
    console.error("❌ Errore:", error.message);
    if (error.response) {
      console.error("❌ Dettagli:", error.response.status, error.response.data);
    }
    res.status(500).send("Errore durante la verifica massiva degli IBAN." + JSON.stringify(error.response.data.errors, null, 2));
  }
});

function mergeInputWithResponse(inputList, responseList) {
  return responseList.map(responseItem => {
    const inputMatch = inputList.find(input => input.requestCode === responseItem.requestCode);
    return {
      ...responseItem,
      anagraficaInfo: inputMatch?.anagraficaInfo || {}
    };
  });
}
function mergeByRequestCode(bodyObj, responseObj) {
  const responsePayload = responseObj?.payload || {};
  const responseList = responsePayload.list || [];

  // Mappa i risultati ricevuti dalla chiamata API per codice richiesta
  const responseMap = new Map();
  responseList.forEach(item => {
    if (item?.requestCode) {
      responseMap.set(item.requestCode, item);
    }
  });

  // Unisci i dati anagrafici e i risultati della verifica
  const mergedList = bodyObj.list.map(item => {
    const match = responseMap.get(item.requestCode);

    if (!match) {
      console.warn(`⚠️ Nessuna corrispondenza per requestCode: ${item.requestCode}`);
    }

    return {
      ...item,
      validationStatus: match?.validationStatus || null,
      error: match?.error || null,
      bankInfo: match?.bankInfo || null,
      requestId: match?.requestId || null
    };
  });

  // 🔁 Ritorna un oggetto strutturato come il JSON iniziale ma con lista unita
  return {
    status: responseObj?.status || 'UNKNOWN',
    bulkRequestId: responsePayload.bulkRequestId,
    bulkRequestStatus: responsePayload.bulkRequestStatus,
    completedDatetime: responsePayload.completedDatetime,
    processedItemsCount: responsePayload.processedItemsCount,
    totalItemsCount: responsePayload.totalItemsCount,
    list: mergedList,
    errors: responseObj?.errors || [],
    warnings: responseObj?.warnings || null
  };
}


module.exports = router;
