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
  addCeremony
} = require("./ZKPartyServer");

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.set({
      "Access-Control-Allow-Origin": "*"
    });

    next();
  });
}

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use("/", express.static(path.join(__dirname, "../client/dist")));

app.post("/api/add-ceremony", async (req, res) => {
  const addCeremonyData = req.body;
  try {
    await addCeremony(addCeremonyData);
    res.sendStatus(200);
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

app.listen(port, () => console.log(`App listening on port ${port}!`));
