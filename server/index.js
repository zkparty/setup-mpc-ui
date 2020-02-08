const admin = require("firebase-admin");
const express = require("express");
const app = express();
const port = 80;
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const morgan = require("morgan");
const serviceAccount = require("./firebase_skey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://zkparty-14974.firebaseio.com"
});

const db = admin.firestore();

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.set({
      "Access-Control-Allow-Origin": "*"
    });

    next();
  });
}

app.use(morgan("dev"));

app.use("/", express.static(path.join(__dirname, "../client/dist")));

app.get("/api/ceremonies", async (req, res) => {
  const snapshot = await db.collection("ceremonies").get();
  const ceremonyStatePromises = [];
  snapshot.forEach(async doc => {
    const ceremony = doc.data();
    ceremony.status = "DISCONNECTED";
    ceremony.id = doc.id;
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
    // should return 404
    res.status(404).send("Ceremony not found.");
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
    delete mpcState.name;
    ceremony = {
      ...ceremony,
      ...mpcState,
      id: req.params.id
    };
    res.json(ceremony);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
