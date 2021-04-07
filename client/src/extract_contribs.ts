import { extractContribs } from './api/FirestoreApi';
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const fs = require('fs');
import firebaseConfig from './app/firebaseConfig';

const run = () => {
    firebase.initializeApp(firebaseConfig);

    extractContribs().then(docs => {
        const contribOut = docs.map(e => {
            const circuitId = e.ref?.parent?.parent?.id;
            const cs: any = {
                circuitId,
                ...e.data(),
            };
            return cs;
        });
        const contribDocs = JSON.stringify(contribOut);

        fs.writeFile(`./contributions.json`, contribDocs, (err: { message: any; }) => {
            if (err) console.warn(err.message);
        });
    });
}

if (require.main == module) {
    run();
}