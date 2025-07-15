<img src="https://www.csea.it/wp-content/uploads/logo/csea-logo.svg" alt="CSEA Logo" height="68"/>
# ✅ Node.js Bootstrap RedMine CheckIban

Un'applicazione Node.js con frontend in **Pug** e backend **Express**, progettata per effettuare controlli IBAN massivi o singoli tramite le API di **PagoPA**.

> 📦 Repository: [github.com/flaviooo/checkIbanApp](https://github.com/flaviooo/checkIbanApp)

---

## 📦 Setup

Assicurati di avere **Node.js** e **npm** installati. Poi esegui:

```bash
express --view=pug checkIbanApp
cd checkIbanApp
npm install
npm install mariadb
npm install dotenv
npm install nodemon --save-dev

## 📦 Usage
# Su Windows
set DEBUG=checkIbanApp:* && npm start
# Su Unix/Linux/Mac
DEBUG=checkIbanApp:* npm start
Per sviluppo continuo: npx nodemon ./bin/www
