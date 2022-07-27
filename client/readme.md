# Trusted Setup browser application using **React**
## 1. Install dependencies
```npm install```

## 2. Setup the firebase configuration file here
``` /src/app/firebaseConfig.ts ```
The content should look like this`
```
const firebaseConfig = {
    apiKey: "PROJECT_API_KEY",
    authDomain: "AUTH_DOMAIN",
    projectId: "PROJECT_ID",
    storageBucket: "STORAGE_BUCKET",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  };

export default firebaseConfig;
```

## 3. Add the pkg directory from small-powers-of-tau in
``` /public/ ```
Remember to check in ```/public/pkg/snippets/wasm-bindgen-rayon../src/workerHelpers.js``` that
the import pkg is referencing the correct file ```../../../small_pot.js```(approximately line 54)

## 4. Run react app with hot reload (development)
```npm start```

## CORS policy for storage file access

* Set web app domain name(s) as origin in cors.json. Add a localhost entry for testing with emulators
* Run this command, substituting your storage domain name:

`gsutil cors set cors.json gs://trustedsetup-a86f4.appspot.com`

See https://groups.google.com/g/firebase-talk/c/oSPWMS7MSNA/m/RnvU6aqtFwAJ?pli=1
