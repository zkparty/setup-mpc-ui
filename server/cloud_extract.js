const { getVerifiedContribs } = require('./FirebaseApi');
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const fs = require('fs');
const firebaseConfig = require('./firebase_skey.json');

const run = () => {
    firebase.initializeApp(firebaseConfig);

    getVerifiedContribs().then(circuits => {
        console.log(`return circuits: ${circuits.length}`);
        circuits.forEach(cct => {
            const cctNum = ('00' + cct.number).substr(-2);           
            let fd;
            fs.open(`circuit${cctNum}_${cct.id}.sh`,'w', (err, fd) => {
                if (err) {
                    console.warn(err.message);
                    return;
                }
                fs.write(fd, '#! /bin/bash\n\n', err => {if (err) console.warn(err.message)});

                cct.contributions.forEach(cont => {
                    const contNum = ('0000' + cont.contributor).substr(-4);
                    fs.write(fd, `gsutil cp ph2_${contNum}.zkey gs://zkopru-mpc-files/circuit${cctNum}/c${cctNum}_${contNum}_${cont.username}.zkey\n`, err => {if (err) console.warn(err.message)});
                    fs.write(fd, `gsutil cp verification_${cont.contributor}.txt gs://zkopru-mpc-files/circuit${cctNum}/c${cctNum}_transcript_${contNum}.txt\n`, err => {if (err) console.warn(err.message)});
                })
                fs.close(fd, err => {if (err) console.warn(err.message)});
            });
            fs.open(`c${cctNum}_index.html`,'w', (err, fd) => {
                if (err) {
                    console.warn(err.message);
                    return;
                }
                //fs.write(fd, '<tr>\n', err => {if (err) console.warn(err.message)});

                let i = 1;
                cct.contributions.forEach(cont => {
                    const contNum = ('0000' + cont.contributor).substr(-4);
                    fs.writeSync(fd, `<tr>\n<td>${i++}</td>\n` +
                        `<td>${cont.username}</td>\n` +
                        `<td><a href="./c${cctNum}_${contNum}_${cont.username}.zkey">download</a></td>\n` +
                        `<td><a href="./c${cctNum}_transcript_${contNum}.txt">link</a></td>\n` +
                        `</tr>\n`,
                        err => {if (err) console.warn(err.message)});
                })
                fs.close(fd, err => {if (err) console.warn(err.message)});
            });
        });
    });
}

if (require.main == module) {
    run();
}