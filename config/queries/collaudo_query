 SELECT distinct  b.iban,  s.partitaIva, s.riferimentoLegale, s.codiceFiscaleRapp, s.ragioneSociale 
 FROM anagrafica.banca b 
 left JOIN anagrafica.settoriattivita sa ON b.idSettoreAttivita = sa.idSettoreattivita
 JOIN anagrafica.soggetto s ON s.idsoggetto= sa.idsoggetto
 JOIN anagrafica.stato_antimafia_soggetto sas ON sas.idSoggetto =  s.idsoggetto
 JOIN anagrafica.stato_antimafia santima ON  santima.id = sas.idStatoAntimafia
 JOIN anagrafica.tipologiasoggetto ts ON sa.idTipologia=ts.idtipologia 
 left JOIN anagrafica.dettagliotipologia dt ON sa.idTipologia=dt.idTipologia AND sa.iddettaglio = dt.iddettaglio
 WHERE  test =0 AND sas.idStatoAntimafia not in ('9','5','3','0') and 
 ATTIVO = 1 AND predefinita = 1 and b.iban is not null and b.iban <> '' and partitaIva IS NOT NULL