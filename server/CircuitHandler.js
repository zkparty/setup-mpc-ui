//import snarkjs from "snarkjs";
const r1csfile = require("r1csfile");
const fs = require("fs");
const firebase = require("firebase");

async function getCircuitInfo(ceremonyId) {
    await openR1csFile(ceremonyId);
    //r1csfile.load()
};

async function openR1csFile(ceremonyId) {
    const storageRef = firebase.storage().ref();
    const ceremonyDataRef = storageRef.child(`ceremony_data/${ceremonyId}`);

    return ceremonyDataRef.ListAll().then((res) => {
        res.items.forEach((i) => console.log(`list result: ${i}`));
    });
};

async function prepareCircuit(circuitId) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({a: 10, b: 21}, "circuit.wasm", "circuit_final.zkey");

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    const vKey = JSON.parse(fs.readFileSync("verification_key.json"));

    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }

}

module.exports = {
    openR1csFile,
}
