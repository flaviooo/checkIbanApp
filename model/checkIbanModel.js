const mysql = require('mysql');
const fs = require('fs');

const connection = mysql.createConnection({
  host: '192.168.70.118',
  user: 'asi_flavio_tuosto',
  password: process.env.PASSWORD_DB,
  database: 'anagrafica'
});

connection.connect();

module.exports = {
  getInfoAnagrafica() {
    return new Promise((resolve, reject) => {
      const queryAnagraficaCSEA = `
        SELECT a.iban, a.partitaIva
        FROM (
          SELECT DISTINCT b.iban, s.partitaIva
          FROM anagrafica.soggetto s
          JOIN anagrafica.settoriattivita sa ON s.idsoggetto = sa.idsoggetto
          JOIN anagrafica.tipologiasoggetto ts ON sa.idTipologia = ts.idtipologia
          JOIN anagrafica.dettagliotipologia dt ON sa.idTipologia = dt.idTipologia AND sa.iddettaglio = dt.iddettaglio
          LEFT JOIN anagrafica.banca b ON sa.idSettoreattivita = b.idSettoreattivita
          WHERE test = 0 AND ATTIVO = 1 AND predefinita = 1
            AND b.iban IS NOT NULL AND partitaIva IS NOT NULL
        ) a
        GROUP BY a.iban, a.partitaIva;
      `;

      connection.query(queryAnagraficaCSEA, (error, results) => {
        if (error) {
          console.error('❌ Errore nella query:', error);
          connection.end();
          return reject(error);
        }

        const validResults = results.filter(row =>
          row.iban && row.iban.trim() !== '' &&
          row.partitaIva && row.partitaIva.trim() !== ''
        );

        const limitedResults = validResults.slice(0, 999);

        if (validResults.length > 1000) {
          console.warn(`⚠️ Troppi risultati (${validResults.length}). Esportati solo i primi 1000.`);
        } else {
          console.log(`✅ Esportati ${validResults.length} risultati.`);
        }

        const jsonFormatted = {
          list: limitedResults.map((row, index) => ({
            requestCode: `RQ${(index + 1).toString().padStart(2, '0')}`,
            account: {
              value: row.iban,
              valueType: 'IBAN',
              bicCode: null
            },
            accountHolder: {
              type: 'PERSON_LEGAL',
              fiscalCode: null,
              vatCode: row.partitaIva,
              taxCode: null
            }
          }))
        };

        fs.writeFile('output.json', JSON.stringify(jsonFormatted, null, 2), 'utf8', err => {
          if (err) {
            console.error('❌ Errore scrivendo il file JSON:', err);
          } else {
            console.log('✅ File JSON generato correttamente: output2.json');
          }
        });

        resolve(jsonFormatted);
        connection.end();

      });
    });
  }
};
