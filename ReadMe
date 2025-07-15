Node.js Bootstrap RedMine CheckIban
===

A quick and easy Node.js + Pug template project
![Image](https://www.csea.it/wp-content/uploads/logo/csea-logo.svg)
##### Also available for [GIT URL](https://github.com/flaviooo/checkIbanApp.git)
_ Assuming you have already installed Node...

express --view=pug checkIbanApp
cd checkIbanApp
npm install
npm install mariadb
npm install nodemon --save-dev
npm install dotenv


## Usage
set DEBUG=checkIbanApp:* | npm start

" select a.iban, a.partitaIva "+
" from (SELECT  distinct b.iban, s.partitaIva "+
" FROM anagrafica.soggetto s "+
"   JOIN anagrafica.settoriattivita sa ON s.idsoggetto=sa.idsoggetto "+
"   JOIN anagrafica.tipologiasoggetto ts ON sa.idTipologia=ts.idtipologia "+
"   JOIN anagrafica.dettagliotipologia dt ON sa.idTipologia=dt.idTipologia AND sa.iddettaglio = dt.iddettaglio "+
" LEFT JOIN anagrafica.banca b ON sa.idSettoreattivita = b.idSettoreattivita "+
" WhERE  test =0   AND ATTIVO = 1 AND predefinita=1 and b.iban is not null and partitaIva IS NOT NULL) a "+
" group by a.iban, a.partitaIva; ";
