const express = require('express');
const router = express.Router();
const checkIbanModel = require('../model/checkIbanModel');
const axios = require('axios');
const https = require('https');

require('dotenv').config();

const headers = {
    'Content-Type': 'application/json',
    'Auth-Schema': process.env.AUTH_SCHEMA || 'S2S',
    'Api-Key': process.env.API_KEY
};

// Rotta per visualizzare il form
router.get('/', async function (req, res) {
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
        const response = await axios.post(process.env.URL_SINGLE, JSON.stringify(bodyList, null, 2), {
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
        const bodyList = await checkIbanModel.getInfoAnagrafica();

        const response = await axios.post(process.env.URL_MASSIVE, bodyList, {
            headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        res.render('checkIbanViewMassive', {
            title: "Check IBAN Massivi",
            result: response
        });

    } catch (error) {
        console.error("❌ Errore:", error.message);
        if (error.response) {
            console.error("❌ Dettagli:", error.response.status, error.response.data);
        }
        res.status(500).send("Errore durante la verifica massiva degli IBAN.");
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

    const url = `${process.env.URL_MASSIVE}/${bulkRequestId}`;
    console.log("🔗 URL chiamata:", url);

    const response = await axios.get(url, {
      headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // ⚠️ Solo in sandbox
    });

    console.log("✅ Dati ricevuti:", response.data);
        res.render('checkIbanVerificaMassive', {
            title: "Check IBAN Massivi",
            result: response.data
        });

    } catch (error) {
        console.error("❌ Errore:", error.message);
        if (error.response) {
            console.error("❌ Dettagli:", error.response.status, error.response.data);
        }
        res.status(500).send("Errore durante la verifica massiva degli IBAN.");
    }
});

module.exports = router;
