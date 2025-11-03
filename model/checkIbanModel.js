const cfg = require('./../config');
const fs = require('fs');
const path = require('path');

pool = cfg.pool;

module.exports = {
  getInfoAnagrafica() {
    return new Promise((resolve, reject) => {
      const QUERY_DB = cfg.dbQueryFile;

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
  },

  getInfoAnagraficaFiltered(existingIbans = []) {
    return new Promise((resolve, reject) => {
    let QUERY_DB = cfg.dbQuery;
    let QUERY_DB_B = cfg.dbQueryFileWithCondition;
    let temp = " "
        
    if (existingIbans.length) {
      // Costruisci la parte WHERE NOT IN (...) dinamicamente
      const escapedIbans = existingIbans.map(iban => pool.escape(iban)).join(',');
      temp += escapedIbans;
    }
    QUERY_DB = QUERY_DB_A+temp+QUERY_DB_B;
  fs.writeFileSync(path.join(__dirname, '../test/QUERY_DB.sql'), QUERY_DB);
    //console.log("QUERY_DB:", QUERY_DB);
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
