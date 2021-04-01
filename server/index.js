//const express = require("express");
//const bodyParser = require("body-parser");
//const app = express();
//const port = process.env.PORT || 80;
const path = require("path");
//const morgan = require("morgan");
// const {
//   getCachedSummaries,
//   getAndUpdateStaleSummaries,
//   getCachedCeremony,
//   getAndUpdateStaleCeremony,
//   addCeremony,
//   getUserStatus,
// } = require("./ZKPartyServer");
const { prepareCircuit, verifyContribution } = require("./CircuitHandler");
const { ceremonyEventListener } = require("./FirebaseApi");

require("dotenv").config();

const circuitList = JSON.parse('./circuits.json')

ceremonyEventListener(prepareCircuit, verifyContribution, circuitList);
