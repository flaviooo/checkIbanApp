
const express = require('express');
const router = express.Router();
const cfg = require('./../config');

// ✅ Collega Swagger alla route /api-docs
router.use('/api-docs',  cfg.swaggerUi.serve,  cfg.swaggerUi.setup(cfg.swaggerSpec));

// ✅ Esempio di altre rotte
router.get('/', async function (req, res) {
  try {
    res.render('index', { title: "Index IBAN Page" });
  } catch (error) {
    console.error("❌ Errore rendering form:", error.message);
    res.status(500).send("Errore nella visualizzazione del form.");
  }
});

module.exports = router;

