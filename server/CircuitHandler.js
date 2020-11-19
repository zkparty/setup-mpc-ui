//import snarkjs from "snarkjs";
const r1csfile = require("r1csfile");
const fs = require("fs");
const firebase = require("firebase");
const {Storage} = require("@google-cloud/storage");
const fbSkey = require("./firebase_skey.json");

const storage = new Storage({keyFilename: '/home/geoff/setup-mpc-ui/server/firebase_skey.json', projectId: fbSkey.project_id });

//const bucket = gcs.bucket('');

async function getCircuitInfo(ceremonyId) {
    await openR1csFile(ceremonyId);
    //r1csfile.load()
};

async function openR1csFile(ceremonyId) {
    console.log(`project id ${fbSkey.project_id}`);
    const [files] = await storage.bucket(`${fbSkey.project_id}.appspot.com`).getFiles({
        prefix: 'ceremony_data/', 
        delimiter: '/'
    });
    console.log('Files:');
    files.forEach(file => {
        console.log(file.name);
    });
    //const ceremonyDataRef = storageRef.child(`ceremony_data/${ceremonyId}`);

    //return ceremonyDataRef.ListAll().then((res) => {
      //  res.items.forEach((i) => console.log(`list result: ${i}`));
    //});
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
    prepareCircuit,
    getCircuitInfo,
}
