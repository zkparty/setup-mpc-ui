const admin = require("firebase-admin");
const fs = require('fs');
const firebaseConfig = require('../firebase_skey.json');

const run = () => {

    // NB: PROD. Change for test
    const DB_URL = "https://trustedsetup-a86f4.firebaseio.com"; 
    
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: DB_URL
    });
    
    const db = admin.firestore();

    const cctQuery = db
        .collection('ceremonies/Sd34p8ezfceXSoU6RCKL/events')
        .get();

    cctQuery.then(snap => {
        fs.open(`clrfund_data.csv`,'w', (err, fd) => {
            if (err) {
                console.warn(err.message);
                return;
            }

            snap.forEach(docSnap => {
                const event = docSnap.data();
                if (event.timestamp) {
                    fs.write(fd, `${event.index},${event.timestamp.toMillis()},${event.eventType},\n`,
                        err => {if (err) console.warn(err.message)});
                }
            });
            fs.close(fd, err => {if (err) console.warn(err.message)});
        });
    });
};

if (require.main == module) {
    run();
}