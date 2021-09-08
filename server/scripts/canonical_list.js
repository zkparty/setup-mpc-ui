/* Get a canonical list of valid contributions by parsing the verification log. */
const { getContributions } = require('../FirebaseApi');
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const fs = require('fs');
const reader = require('buffered-reader');
const firebaseConfig = require('../firebase_skey.json');

const run = () => {
    // Read site ls dump. 
    // Generate with: gsutil ls gs://trustedsetup-a86f4.appspot.com/clrfund/circuit01 > circuit01_site.txt
    const gsMap = new Map();

    const readVerif = () => {
        vList = [];
        // Read verification log
        new reader.DataReader ("verification_1972.txt", { encoding: "utf8" })
            .on ("error", function (error){
                console.log ("error: " + error);
            })
            .on ("line", function (line){
                const re = new RegExp('contribution #(.+) (.+):');
                //console.log ("line: " + line);
                const m = line.match(re);
                if (m) {
                    const idx = m[1];
                    const uid = m[2];
                
                    //console.log ("match: " + m[1] + ' : ' + m[2]);
                    const queueIndex = gsMap.get(uid);
                    console.log(`${idx} : ${uid} = ${queueIndex}`);
                    vList.push({idx, uid, queueIndex});
                }
            })
            .on ("end", function (){
                console.log ("EOF");
                fs.open("index_c01.html", 'w', (err, fd) => {
                    if (err)  throw err;
                    
                    vList.reverse().forEach(e => {
                        console.log(`${e.idx} : ${e.uid} = ${e.queueIndex}`);
                        fs.write(fd, Buffer.from(`<tr>
                            <td>${e.idx}</td>
                            <td>${e.uid}</td>
                            <td><a href="./qvt32_${e.queueIndex}_${e.uid}.zkey">${e.queueIndex ? 'download' : 'n/a'}</a></td>
                            <td><a href="./qvt32_${e.queueIndex}_${e.uid}_verification.log">${e.queueIndex ? 'link' : 'n/a'}</a></td>
                            </tr>`), (err) => {if (err) throw err;});
                    });
                })
            })
            .read ();
    };

    new reader.DataReader ("circuit01_site.txt", { encoding: "utf8" })
    .on ("error", function (error){
        console.log ("error: " + error);
    })
    .on ("line", function (line){
        const re = new RegExp('qvt32\_(.+)\_(.+)\.zkey');
        //console.log ("line: " + line);
        const m = line.match(re);
        if (m) {
            gsMap.set(m[2],m[1]);
            console.log ("gs: " + m[1] + ' : ' + m[2]);
        }
    })
    .on ("end", function (){
        console.log ("EOF site");
        readVerif();
    })
    .read();


    // 
/*
    firebase.initializeApp(firebaseConfig);

    getContributions(false).then(circuits => {
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
                    fs.write(fd, `${cont.contributor},${cont.prior},${cont.username
                        },${cont.userId},${cont.duration},${
                        cont.timeCompleted ? cont.timeCompleted.toMillis() : ''},${
                        cont.timeAdded ? cont.timeAdded.toMillis() : ''},${cont.status}\n`,
                        err => {if (err) console.warn(err.message)});
                })
                fs.close(fd, err => {if (err) console.warn(err.message)});
            });
        });
    });
    */
}

if (require.main == module) {
    run();
}