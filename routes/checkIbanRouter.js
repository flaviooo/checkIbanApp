const express = require('express');
const cfg = require('./../config');
const router = express.Router();
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

// Rotta per la verifica singola
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

const urlSingle = cfg.urlSingle; 

        const response = await axios.post(urlSingle, JSON.stringify(bodyList, null, 2), {
            headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        res.render('checkIbanViewSingle', {
            title: 'Verifica IBAN Singolo',
            result: response.data
        });

    } catch (error) {
        console.error("❌ Errore API:", error.message);
        res.status(500).render('checkIbanViewSingle', {
            title: 'Errore Verifica',
            result: { error: 'Errore durante la verifica dell\'IBAN.' }
        });
    }
});

// Rotta per la verifica massiva

router.get('/massive', async function (req, res) {
  try {
    // Ottieni lista input con anagrafica
    const bodyObj = await checkIbanModel.getInfoAnagrafica();

    // Pulisci per invio: rimuovi campo anagraficaInfo prima della chiamata remota
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
    res.status(500).send("Errore durante la verifica massiva degli IBAN. "+error.code);
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
    console.log("🔗 URL chiamata:", url);
     // Ottieni lista input con anagrafica
    const bodyObj = await checkIbanModel.getInfoAnagrafica();

    const response = await axios.get(url, {
      headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // ⚠️ Solo in sandbox
    });
      console.log("✅ Dati ricevuti:", response.data);
    const result = mergeByRequestCode(bodyObj, response.data);
    console.log(JSON.stringify(result, null, 2));

 
        res.render('checkIbanVerificaMassive', {
            title: "Check IBAN Massivi",
            result: response.data,
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
        res.status(500).send("Errore durante la verifica massiva degli IBAN.");
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
  const responseList = responseObj?.payload?.list || [];

  // Crea una mappa basata su requestId del secondo JSON
  const responseMap = new Map();
  responseList.forEach(item => {
    if (item?.requestId) {
      responseMap.set(item.requestId, item);
    }
  });

  // Effettua l'unione basata su requestCode === requestId
  const mergedList = bodyObj.list.map(item => {
    const match = responseMap.get(item.requestCode);

    return {
      ...item,
      ...(match && {
        validationStatus: match.validationStatus || null,
        error: match.error || null,
        bankInfo: match.bankInfo || null
      })
    };
  });

  return { list: mergedList };
}

module.exports = router;
