const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const fs = require('fs');
import { resetContrib } from './api/FirestoreApi';
import firebaseConfig from './app/firebaseConfig';

const run = () => {
    firebase.initializeApp(
        
    );

    fs.readFile('//mnt/c/temp/zkopru/reset_list.csv', 'utf8', (err: any, data: string) => {
        if (err) {
            console.warn(err.message);
            return;
        }
        const lines = data.split('\n');
        const records = lines.map(line => line.split(','));
        console.log(`records: ${records.length}`);
        console.log(`records[1]: ${records[1]}`);

        records.forEach( (record, i) => {
            if (i>0 && record.length >=4) {
                resetContrib(record[1], record[3].trim(), parseInt(record[2]));
            }
        });
    });
}

if (require.main == module) {
    run();
}
