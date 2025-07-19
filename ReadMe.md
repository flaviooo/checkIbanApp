<img src="https://www.csea.it/wp-content/uploads/logo/csea-logo.svg" alt="CSEA Logo" height="68"/>

# ✅ Node.js Bootstrap CheckIban PagoPA

Un'applicazione **Node.js** con frontend in **Pug** e backend **Express**, progettata per effettuare controlli IBAN **singoli** o **massivi** tramite le API di **PagoPA**.

> 🔗 [Documentazione PagoPA API (v4.0)](https://bankingservices.pagopa.it/docs/platform/apis/pagopa-banking-v4.0)  
> 💾 [Repository GitHub](https://github.com/flaviooo/checkIbanApp)

---

## 🚀 Setup iniziale

Assicurati di avere **Node.js** (v18+) e **npm** installati.

### 1️⃣ Clona il progetto ed entra nella directory

```bash
git clone https://github.com/flaviooo/checkIbanApp.git
cd checkIbanApp

2️⃣ Installa le dipendenze

Mostra sempre dettagli

npm install

3️⃣ Installa i pacchetti aggiuntivi (se non già presenti)

Mostra sempre dettagli

npm install config mariadb dotenv
npm install nodemon --save-dev

⚙️ Configurazione
🗂 .env

Copia il file .envSample come .env:

Mostra sempre dettagli

cp .envSample .env

E personalizza almeno:

Mostra sempre dettagli

# API PagoPA

API_KEY=OQLZUKB



# DB Anagrafica

PASSWORD_DB=pass

🗂 config/collaudo.json

Per configurare l'ambiente di collaudo, crea o modifica il file config/collaudo.json così:

Mostra sempre dettagli

{
  "services": {
    "urlMassive": "https://bankingservices-sandbox.pagopa.it/api/pagopa/banking/v4.0/utils/validate-account-holder/bulk",
    "urlSingle": "https://bankingservices-sandbox.pagopa.it/api/pagopa/banking/v4.0/utils/validate-account-holder",
    "apiKey": "${API_KEY}"
  }
}

    ⚠️ Le variabili ${API_KEY} saranno lette automaticamente da .env se usi dotenv.

🧪 Avvio dell'applicazione
✅ Modalità sviluppo

Mostra sempre dettagli

# Linux/macOS
NODE_ENV=collaudo node ./bin/www

# Windows (CMD)
set NODE_ENV=collaudo && node ./bin/www

# Windows (PowerShell)
$env:NODE_ENV="collaudo"; node ./bin/www

Oppure usa nodemon:

Mostra sempre dettagli

npm run nodemon:collaudo

Puoi aggiungere questi script nel tuo package.json:

Mostra sempre dettagli

"scripts": {
  "start:collaudo": "NODE_ENV=collaudo node ./bin/www",
  "nodemon:collaudo": "NODE_ENV=collaudo nodemon ./bin/www"
}

⚠️ Note importanti

    In produzione, evita di disabilitare la validazione SSL.
    Evita:

Mostra sempre dettagli

httpsAgent: new https.Agent({ rejectUnauthorized: false })

    In ambienti sicuri reali, il valore di rejectUnauthorized deve essere true oppure omesso completamente.

📂 Struttura consigliata del progetto

Mostra sempre dettagli

checkIbanApp/
├── bin/
│   └── www
├── config/
│   ├── default.json
│   ├── collaudo.json
│   └── produzione.json
├── model/
├── routes/
├── views/
│   └── *.pug
├── .env
├── app.js
├── package.json
└── README.md

🔒 Sicurezza

    Non caricare il file .env nel repository GitHub.
    Aggiungilo a .gitignore:

Mostra sempre dettagli

echo ".env" >> .gitignore

    Proteggi le credenziali API e database nei file .env.

👨‍💻 Contributi

Pull request e suggerimenti sono benvenuti! Apri una issue o proponi una modifica.
📝 Licenza

Questo progetto è distribuito sotto licenza MIT.
"""