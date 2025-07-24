const cfg = require('./../config');
pool = cfg.pool;

//const mysql = require('mysql');

module.exports = {
  getInfoAnagrafica() {
    return new Promise((resolve, reject) => {
      const QUERY_DB = cfg.dbQuery;

      pool.query(QUERY_DB, (error, results) => {
        if (error) {
          console.error('❌ Errore nella query:', error);
          return reject(error);
        }

        const validResults = results.filter(row =>
          row.iban && row.iban.trim() !== '' &&
          row.partitaIva && row.partitaIva.trim() !== ''
        );

        const limite = cfg.limitQuery;
        const limitedResults = validResults.slice(0, limite);

        if (validResults.length > limite) {
          console.warn(`⚠️ Troppi risultati (${validResults.length}). Esportati solo i primi ${limite}`);
        } else {
          console.log(`✅ Esportati ${validResults.length} risultati.`);
        }

        const jsonFormatted = {
          list: limitedResults.map((row, index) => ({
            requestCode: `RQ${(index + 1).toString().padStart(2, '0')}`,
            anagraficaInfo: {
              requestCode: `RQ${(index + 1).toString().padStart(2, '0')}`,
              ragioneSociale: row.ragioneSociale,
              riferimentoLegale: row.riferimentoLegale,
              codiceFiscaleRapp: row.codiceFiscaleRapp
            },
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
// fs.writeFile('output.json', JSON.stringify(jsonFormatted, null, 2), 'utf8', err => {
        //   if (err) {
        //     console.error('❌ Errore scrivendo il file JSON:', err);
        //   } else {
        //     console.log('✅ File JSON generato correttamente: output2.json');
        //   }
        // });
        resolve(jsonFormatted);
      });
    });
  }
};
