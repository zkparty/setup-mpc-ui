const snarkjs = require("snarkjs");
//const r1csfile = require("r1csfile");
const fs = require("fs");
const firebase = require("firebase");
const {Storage} = require("@google-cloud/storage");
const Logger = require("js-logger");
const fbSkey = require("./firebase_skey.json");
const { updateFBCeremony } = require("./FirebaseApi");

var logCatcher = [];
const captureHandler = (messages, context) => {
    if (context.level === Logger.INFO) {
        logCatcher.push(messages[0]);
    }
};
const consoleHandler = Logger.createDefaultHandler();
Logger.useDefaults();
Logger.setHandler((m, c) => {
    captureHandler(m,c);
    consoleHandler(m,c);
});
const catchLogger = Logger.get("catcher");
const consoleLogger = Logger.get("console");

const storage = new Storage({keyFilename: `${process.cwd()}/firebase_skey.json`, projectId: fbSkey.project_id });

const POT_FILE_PATTERN='pot%EXP%_final.ptau';

const checkAndDownloadFromStorage = async (prefix, fileNameFilter, deriveLocalPath) => {
    //console.log(`project id ${fbSkey.project_id}`);
    const [files] = await storage.bucket(`${fbSkey.project_id}.appspot.com`).getFiles({
        prefix: prefix, 
        delimiter: '/'
    });
    //console.log('Files:');
    const matchFiles = files.filter(file => fileNameFilter(file.name));
    if (matchFiles.length > 0) {
        console.log(`found matching file ${matchFiles[0].name}`);
        const destFile = deriveLocalPath(matchFiles[0].name);
        const file = await matchFiles[0].download({
            destination: destFile,
        });
        console.log(`Downloaded ${destFile}`);
        return destFile;
    } else {
        console.log(`no matching file found.`);
        return false;
    }
};

async function prepareCircuit(ceremonyId) {
    console.log(`prepareCircuit ${ceremonyId}`);
    const r1csFile = await checkAndDownloadFromStorage(
        `ceremony_data/${ceremonyId}/`,
        filename => filename.toLowerCase().endsWith('.r1cs'),
        filename => `./data/${filename}`
    );
    if (r1csFile) {
        console.log(`Downloaded ${r1csFile}`);
        // Get circuit info
        logCatcher = [];
        // TODO - make snarkjs return a JSON object
        await snarkjs.r1cs.info(r1csFile, catchLogger);
        var numConstraints = 0;
        logCatcher.forEach(m => {
            console.log(`m: ${m}`);
            const result = m.match(/Constraints: ([0-9]+)/);
            if (result && result.length > 1) numConstraints = result[1];
        });
        console.log(`#Constraints: ${numConstraints}`);
        const powers = Math.ceil(Math.log2(numConstraints));
        console.log(`Powers needed: ${powers}`);
        // Update ceremony in firebase store
        const ceremonyUpdate = {
            id: ceremonyId,
            numConstraints: parseInt(numConstraints),
            powersNeeded: powers,
            participants: [],
        };
        await updateFBCeremony(ceremonyUpdate);
        console.log('Ceremony updated');

        // Prepare zkey file
        const potFile = POT_FILE_PATTERN.replace("%EXP%", powers);
        console.log(`PoT file: ${potFile}`);
        const potPath = `./data/ptau/${potFile}`;
        // See if we have the file locally
        fs.stat(potPath, async (err, stat) => {
            if (err == null) {
                console.log('Already have PoT file');
            } else if (err.code === 'ENOENT') {
                // Look for it on storage, then download it.
                const potFileLocal = await checkAndDownloadFromStorage(
                    'ptau/',
                    filename => filename.endsWith(potFile),
                    () => potPath
                );
                // TODO - put these status messages in a status field on tghe FB ceremony doc
                if (!potFileLocal) throw `Couldn't find or download download PoT file`;
            } else throw err;

            // Have PoT & r1cs files. Now make the zkey file.
            const zkeyFile = `./data/ceremony_data/${ceremonyId}/ph2_0000.zkey`;
            await snarkjs.zKey.newZKey(r1csFile, potPath, zkeyFile, consoleLogger);
            console.log(`Zkey file generated: ${zkeyFile}`);
        });
    } else {
        console.log(`no R1CS file found for ${ceremonyId}.`);        
    }
};

module.exports = {
    prepareCircuit,
}
