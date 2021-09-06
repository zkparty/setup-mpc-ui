const { getVerifiedContribs } = require('../FirebaseApi');
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const fs = require('fs');
const firebaseConfig = require('../firebase_skey.json');

const run = () => {
    firebase.initializeApp(firebaseConfig);

    getVerifiedContribs().then(circuits => {
        console.log(`return circuits: ${circuits.length}`);
        circuits.forEach(cct => {
            const cctNum = ('00' + cct.number).substr(-2);           
            let fd;
            fs.open(`circuit${cctNum}_data.csv`,'w', (err, fd) => {
                if (err) {
                    console.warn(err.message);
                    return;
                }

                cct.contributions.forEach(cont => {
                    fs.write(fd, `${cont.contributor},${cont.prior},${cont.username},${cont.userId},${cont.duration},${
                        cont.timeCompleted ? cont.timeCompleted.toMillis() : ''}\n`, err => {if (err) console.warn(err.message)});
                })
                fs.close(fd, err => {if (err) console.warn(err.message)});
            });
        });
    });
}

if (require.main == module) {
    run();
}