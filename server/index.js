const { prepareCircuit, verifyContribution } = require("./CircuitHandler");
const { ceremonyEventListener } = require("./FirebaseApi");

require("dotenv").config();

const circuitList = require('./circuits.json');

ceremonyEventListener(prepareCircuit, verifyContribution, circuitList);
