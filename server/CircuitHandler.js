const snarkjs = require("snarkjs");
const r1csfile = require("r1csfile");
const fs = require("fs");
const firebase = require("firebase");
const {Storage} = require("@google-cloud/storage");
const fbSkey = require("./firebase_skey.json");
const Logger = require("js-logger");

var logCatcher = [];
Logger.useDefaults();
Logger.setHandler((messages, context) => {
    console.log(`messages: ${messages[0]} ${context.level.toString()}`);
    if (context.level === Logger.INFO) {
        logCatcher.push(messages[0]);
    }
});

const storage = new Storage({keyFilename: '/home/geoff/setup-mpc-ui/server/firebase_skey.json', projectId: fbSkey.project_id });

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
    //console.log('Files:');
    const r1csFiles = files.filter(file => {
        return file.name.toLowerCase().endsWith('.r1cs');
    });
    if (r1csFiles.length > 0) {
        console.log(`found R1CS file ${r1csFiles[0].name}`);
        const destFile = `./data/${r1csFiles[0].name}`;
        const file = await r1csFiles[0].download({
            destination: destFile,
        });
        console.log(`Downloaded ${destFile}`);
        // Get circuit info
        logCatcher = [];
        await snarkjs.r1cs.info(destFile, Logger);
        var numConstraints = 0;
        logCatcher.forEach(m => {
            console.log(`m: ${m}`);
            const result = m.match(/Constraints: ([0-9]+)/);
            if (result && result.length > 1) numConstraints = result[1];
        });
        console.log(`#Constraints: ${numConstraints}`);
    } else {
        console.log(`no R1CS file found for ${ceremonyId}.`);        
    }
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
