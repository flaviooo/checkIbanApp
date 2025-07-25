module.exports = {
  app: {
    port: 3002,
    nameApp: "Check Iban CSEA Default"
  },
  services: {
    authSchema: "S2S",
    urlMassive: "https://bankingservices-sandbox.pagopa.it/api/pagopa/banking/v4.0/utils/validate-account-holder/bulk",
    urlSingle: "https://bankingservices-sandbox.pagopa.it/api/pagopa/banking/v4.0/utils/validate-account-holder"
  },
  db: {
    query: `select a.iban, a.partitaIva, a.ragioneSociale, a.riferimentoLegale, a.codiceFiscaleRapp 
            from (
              SELECT DISTINCT b.idbancaSoggetto, b.iban, s.partitaIva, s.riferimentoLegale, s.codiceFiscaleRapp, s.ragioneSociale
              FROM anagrafica.banca b
              LEFT JOIN anagrafica.settoriattivita sa ON b.idSettoreAttivita = sa.idSettoreattivita
              JOIN anagrafica.soggetto s ON s.idsoggetto=sa.idsoggetto
              JOIN anagrafica.tipologiasoggetto ts ON sa.idTipologia=ts.idtipologia
              LEFT JOIN anagrafica.dettagliotipologia dt ON sa.idTipologia=dt.idTipologia AND sa.iddettaglio=dt.iddettaglio
              WHERE test=0 AND ATTIVO=1 AND predefinita=1 AND b.iban IS NOT NULL AND b.iban <> '' AND partitaIva IS NOT NULL
            ) a
            GROUP BY a.iban, a.partitaIva;`
  }
};
