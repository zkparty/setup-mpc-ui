const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 80;
const path = require("path");
const morgan = require("morgan");
const {
  getCachedSummaries,
  getAndUpdateStaleSummaries,
  getCachedCeremony,
  getAndUpdateStaleCeremony,
  addCeremony,
  getUserStatus,
} = require("./ZKPartyServer");
const { prepareCircuit } = require("./CircuitHandler");
const { ceremonyEventListener } = require("./FirebaseApi");

require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });

    next();
  });
}

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use("/", express.static(path.join(__dirname, "../client/dist")));

app.post("/api/get-user-status", async (req, res) => {
  const userId = req.body;
  res.send(getUserStatus(userId)); 
});

app.post("/api/add-ceremony", async (req, res) => {
  const addCeremonyData = req.body;
  try {
    const id = await addCeremony(addCeremonyData);
    res.send(JSON.stringify({id}));
    //res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(400).send(e);
  }
});

app.get("/api/ceremonies-cached", async (req, res) => {
  try {
    const summaries = await getCachedSummaries();
    res.json(summaries);
  } catch (e) {
    console.error(e);
    res.status(400).send(e);
  }
});

app.get("/api/ceremonies", async (req, res) => {
  try {
    const summaries = await getAndUpdateStaleSummaries();
    res.json(summaries);
  } catch (e) {
    console.error(e);
    res.status(400).send(e);
  }
});

app.get("/api/ceremony-cached/:id", async (req, res) => {
  try {
    const ceremony = await getCachedCeremony(req.params.id);
    res.json(ceremony);
  } catch (e) {
    // probably ceremony doesn't exist
    console.error(e);
    res.status(404).send(e);
  }
});

app.get("/api/ceremony/:id", async (req, res) => {
  try {
    const ceremony = await getAndUpdateStaleCeremony(req.params.id);
    res.json(ceremony);
  } catch (e) {
    // probably ceremony doesn't exist
    console.error(e);
    res.status(404).send(e);
  }
});

app.get("/api/prepare-ceremony/:id", async (req, res) => {
  try {
    console.log(`${req.params.id}`)
    await prepareCircuit(req.params.id);
    res.json({ok: true});
    //res.json(ceremony);
  } catch (e) {
    // probably ceremony doesn't exist
    console.error(e);
    res.status(404).send(e);
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

ceremonyEventListener(prepareCircuit);
