<img src="https://www.csea.it/wp-content/uploads/logo/csea-logo.svg" alt="CSEA Logo" height="68"/>
# ✅ Node.js Bootstrap RedMine CheckIban

Un'applicazione Node.js con frontend in **Pug** e backend **Express**, progettata per effettuare controlli IBAN massivi o singoli tramite le API di **PagoPA**. 
> 📦 Documentazione PaoPA API : [https://bankingservices.pagopa.it/docs/platform/apis/pagopa-banking-v4.0](https://bankingservices.pagopa.it/docs/platform/apis/pagopa-banking-v4.0)

> 📦 Repository: [github.com/flaviooo/checkIbanApp](https://github.com/flaviooo/checkIbanApp)

---

## 📦 Setup

Assicurati di avere **Node.js** e **npm** installati. Poi esegui:

```bash
express --view=pug checkIbanApp
git clone https://github.com/flaviooo/checkIbanApp.git
cd checkIbanApp
npm install
npm install mariadb
npm install dotenv
npm install nodemon --save-dev

## 📦 Usage
# Su Windows
set DEBUG=checkIbanApp:* | npm start
npm run start
# Su Unix/Linux/Mac
DEBUG=checkIbanApp:* npm start
Per sviluppo continuo: npx nodemon ./bin/www

Per la produzione va tolto il   httpsAgent: new https.Agent({ rejectUnauthorized: false }) => true

