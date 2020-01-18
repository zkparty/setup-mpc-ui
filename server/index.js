const admin = require("firebase-admin");
const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const serviceAccount = require("./firebase_skey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://zkparty-14974.firebaseio.com"
});

const db = admin.firestore();

let counter = 0;

app.get("/s1", (req, res) => {
  res.send(`
    <h1>hello world for the ${counter++} time</h1>
    <script>
      document.querySelector("h1").innerText += ", goons";
    </script>
  `);
});

app.get("/s2", (req, res) => {
  const fileContents = fs.readFileSync("./index.js");

  res.send(fileContents.toString());
});

app.get("/s3*", (req, res) => {
  const requestPath = req.path.slice("/s3".length);
  const serverPath = __dirname;
  const completePath = path.join(serverPath, requestPath);

  const fileContents = fs.readFileSync(completePath).toString();
  res.send(fileContents);
});

app.use("/", express.static(path.join(__dirname, "../client/dist")));

app.get("/api/ceremonies", async (req, res) => {
  const snapshot = await db.collection("ceremonies").get();
  const ceremonyStatePromises = [];
  snapshot.forEach(async doc => {
    const ceremony = doc.data();
    ceremony.status = "DISCONNECTED";
    const ceremonyPromise = axios
      .get(ceremony.ip + "/api/state")
      .then(response => {
        ceremony.status = response.data.ceremonyState;
        return ceremony;
      })
      .catch(() => {
        return ceremony;
      });
    ceremonyStatePromises.push(ceremonyPromise);
  });
  const ceremonies = await Promise.all(ceremonyStatePromises);
  res.json(ceremonies);
});

app.get("/api/ceremony/:id", async (req, res) => {
  const doc = await db
    .collection("ceremonies")
    .doc(req.params.id)
    .get();
  if (!doc.exists) {
    res.json({
      exists: false
    });
  } else {
    let ceremony = doc.data();
    ceremony.status = "DISCONNECTED";
    const mpcState = await axios
      .get(ceremony.ip + "/api/state")
      .then(response => {
        return response.data;
      })
      .catch(err => {
        return { ceremonyState: "DISCONNECTED" };
      });
    ceremony = {
      ...ceremony,
      ...mpcState
    };
    ceremony.status = ceremony.ceremonyState;
    delete ceremony.ceremonyState;
    console.log(mpcState);
    res.json(ceremony);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
