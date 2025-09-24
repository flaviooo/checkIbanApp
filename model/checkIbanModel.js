const cfg = require('./../config');
const fs = require('fs');
const path = require('path');

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
  },
  getInfoAnagraficaFiltered(existingIbans = []) {
    return new Promise((resolve, reject) => {
     // const QUERY_DB = cfg.dbQuery;
      let temp = " AND iban NOT IN  ("
  let QUERY_DB_A =  "select a.iban, a.partitaIva, a.ragioneSociale, a.riferimentoLegale, a.codiceFiscaleRapp from (SELECT distinct b.idbancaSoggetto, b.iban, s.partitaIva, s.riferimentoLegale, s.codiceFiscaleRapp, s.ragioneSociale FROM anagrafica.banca b left JOIN anagrafica.settoriattivita sa ON b.idSettoreAttivita = sa.idSettoreattivita JOIN anagrafica.soggetto s ON s.idsoggetto= sa.idsoggetto JOIN anagrafica.tipologiasoggetto ts ON sa.idTipologia=ts.idtipologia left JOIN anagrafica.dettagliotipologia dt ON sa.idTipologia=dt.idTipologia AND sa.iddettaglio = dt.iddettaglio WHERE test =0 AND ATTIVO = 1 AND predefinita = 1 and b.iban is not null and b.iban <> '' and partitaIva IS NOT NULL ";
  let QUERY_DB_B = " )) a group by a.iban, a.partitaIva;" 

    if (existingIbans.length) {
      // Costruisci la parte WHERE NOT IN (...) dinamicamente
      const escapedIbans = existingIbans.map(iban => pool.escape(iban)).join(',');
      temp += escapedIbans;
    }
 let QUERY_DB = QUERY_DB_A+temp+QUERY_DB_B;
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
