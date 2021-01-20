const snarkjs = require("snarkjs");
//const r1csfile = require("r1csfile");
const fs = require("fs");
const path = require("path");
const util = require("util");
const firebase = require("firebase");
const {Storage} = require("@google-cloud/storage");
const Logger = require("js-logger");
const fbSkey = require("./firebase_skey.json");
const { updateFBCeremony, addStatusUpdateEvent } = require("./FirebaseApi");

const mkdirAsync = util.promisify(fs.mkdir);

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
        // mkdir ceremony_data/<id>
        const dataPath = path.join(__dirname, 'data', prefix);
        await mkdirAsync(dataPath, { recursive: true })
            .catch(err => console.error(err));
        console.log(`${dataPath} created`); 
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

const uploadParams = async (ceremonyId, paramsFileName, paramsFile) => {
    //const storage = firebase.storage();
    const fileRef = await storage.bucket(`${fbSkey.project_id}.appspot.com`).upload(paramsFile,{
        destination: `ceremony_data/${ceremonyId}/${paramsFileName}`
    });
    //const snapshot = await fileRef.put(paramsFile);
    console.log(`Params uploaded to ${fileRef[0].name}.`);
    return fileRef[0];
};


async function prepareCircuit(ceremonyId) {
    console.log(`prepareCircuit ${ceremonyId}`);
    const r1csFile = await checkAndDownloadFromStorage(
        `ceremony_data/${ceremonyId}/`,
        filename => filename.toLowerCase().endsWith('.r1cs'),
        filename => path.join(__dirname, 'data', filename)
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
        addStatusUpdateEvent(ceremonyId, `Circuit file parsed. The circuit has ${numConstraints} constraints. It will require 2**${powers} powers of tau.`);
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
                // TODO - put these status messages in a status field on the FB ceremony doc
                if (!potFileLocal) throw `Couldn't find or download download PoT file`;
                addStatusUpdateEvent(ceremonyId, `Powers-of-tau file is available: ${potFileLocal}`);

            } else throw err;

            // TODO catch errors
            // Have PoT & r1cs files. Now make the zkey file.
            const zkeyFile = path.join(__dirname, 'data', 'ceremony_data', ceremonyId, 'ph2_0000.zkey');
            await snarkjs.zKey.newZKey(r1csFile, potPath, zkeyFile, consoleLogger);
            console.log(`Zkey file generated: ${zkeyFile}`);
            addStatusUpdateEvent(ceremonyId, `zKey file has been created.  ${zkeyFile}`);
            // export bellman params file
            const paramsFileName = 'ph2_0000.params';
            const paramsFile = path.join(__dirname, 'data', 'ceremony_data', ceremonyId, paramsFileName);
            await snarkjs.zKey.exportBellman(zkeyFile, paramsFile, consoleLogger);
            addStatusUpdateEvent(ceremonyId, `Params file has been created.  ${paramsFile}`);
            // Upload to storage
            const storageFile = await uploadParams(ceremonyId, paramsFileName, paramsFile);
            addStatusUpdateEvent(ceremonyId, `Params file has been uploaded to storage. ${storageFile.path}`);
            // Set ceremony to WAITING
            updateFBCeremony({id: ceremonyId, ceremonyState: 'PRESELECTION'});
        });
    } else {
        console.log(`no R1CS file found for ${ceremonyId}.`);        
    }
};

module.exports = {
    prepareCircuit,
}
