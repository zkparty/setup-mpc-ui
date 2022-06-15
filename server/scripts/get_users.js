const { getContributions, getUserById } = require('../FirebaseApi');
const firebase = require('firebase/app');
const fs = require('fs');
const firebaseConfig = require('../firebase_skey.json');

const run = () => {
    firebase.initializeApp(firebaseConfig);

    const accepted = [new Map(), new Map()];
    for (let c of [1, 2]) {
        const verif = fs.readFileSync(`verified_c0${c}.csv`, 'UTF-8');
        for (const line of verif.split('\n')) {
            //console.log(`line: ${line}`);
            const fields = line.split(',');
            //console.log(`fields: ${fields[2]}`);
            if (fields.length > 2) {
                accepted[c-1].set(
                    fields[1],
                    {
                        index: fields[0],
                        username: fields[1],
                        qIndex: fields[2],
                    });
            }
        }
    };
    console.log(`accepted sizes: ${accepted[0].size} ${accepted[1].size}`);

    const userMap = new Map();
    getContributions(false).then(circuits => {
        console.log(`return circuits: ${circuits.length}`);
        let promises = [];

        circuits.forEach(cct => {
            //const cctNum = ('00' + cct.number).substr(-2);
            
            cct.contributions.forEach(cont => {
                promises.push(new Promise((resolve, reject) => {
                    if (!cont.userId) reject('No userId');

                    // establish whether accepted
                    let acceptedStatus = false;
                    if (accepted[cct.number - 1].has(cont.username)) {
                        acceptedStatus = accepted[cct.number - 1].get(cont.username);
                    }

                    //console.log(`got user: ${cont.username} ${cct.number} ${acceptedStatus}`);

                    let userRecord; 
                    let found = false;
                    if (userMap.has(cont.username)) {
                        console.log(`cct ${cct.number} ${cont.username} already in userMap`);
                        userRecord = userMap.get(cont.username);
                        found = true;
                    } else {
                        userRecord = { email: '', ccts: [{}, {}] };
                        //userMap.set(cont.username, userRecord);
                        //getUserById(cont.userId).then(user => {
                        //    userRecord.email = user.email;
                            userMap.set(cont.username, userRecord);
                        //    resolve();
                        //}).catch(err => {                         
                        //    console.log(`Err in getUserById: ${cont.userId} ${err.message}`)
                        //    reject(err);
                        //});
                    }
                    userRecord.ccts[cct.number - 1] = {
                        qIndex: cont.contributor, 
                        duration: cont.duration,
                        timeAdded: cont.timeAdded,
                        timerCompleted: cont.timeCompleted,
                        status: cont.status,
                        accepted: acceptedStatus,
                    }
                    userRecord.userId = cont.userId;
                    userRecord.username = cont.username;
                    //if (found) {
                        resolve();
                    //}

                }));
            });
        });
        Promise.allSettled(promises).then( () => {
            console.log(`promises done`);
            fs.open(`user_data.csv`,'w', (err, fd) => {
                if (err) {
                    console.warn(err.message);
                    return;
                }

                console.log(`userMap has ${userMap.size}`);
                fs.write(fd, 'email, uid, username, c1_index, c1_duration, c1_added, c1_completed, c1_status, c2_index, c2_duration, c2_added, c2_completed, c2_status\n',
                    err => {if (err) console.warn(err.message)});
                //const it = userMap.values();
                for (const user of userMap.values()) {
                    //const user = it.next().value;
                    //console.log(`Writing user ${user.username}`);
                    if (user) {
                        fs.writeSync(fd, `${user.email},${user.userId},${user.username},`, 
                            err => {if (err) console.warn(err.message)});
                        for (let i in [0,1]) {
                            let cct = user.ccts[i];
                            let status = cct.status;
                            if (!!cct.accepted) {
                                status = 'ACCEPTED';
                            } else {
                                if (status === 'COMPLETE') {
                                    status = 'NOT_ACCEPTED';
                                } else {
                                    status = 'ERROR/TIMEOUT';
                                }
                            }
                            fs.writeSync(fd, `${cct.qIndex},${cct.duration
                                },${
                                user.timeAdded ? user.timeAdded.toMillis() : ''},${
                                user.timeCompleted ? user.timeCompleted.toMillis() : ''},${
                                status},`,
                                err => {if (err) console.warn(err.message)});
                        }
                        fs.writeSync(fd, '\n', err => {if (err) console.warn(err.message)});
                    }
                }

                fs.close(fd, err => {if (err) console.warn(err.message)});
            });
        });
        console.log(`done stage 1`);

        const file = fs.readFileSync('user_data.csv', 'UTF-8');
        promises = [];
        fs.open('user_data_e.csv', 'w', (err, fd) => {
            if (err) {
                console.warn(err.message);
                return;
            }

            for (const line of file.split('\n')) {
                const fields = line.split(',');
                if (fields.length > 1) {
                    const uid = fields[1];
                    promises.push(new Promise((resolve, reject) => {
                        getUserById(uid)
                            .then(user => {
                                fields[0] = user.email;
                                const newLine = fields.reduce((prev, curr, i) => {
                                    return prev + (i>0 ? ',': '') + curr;
                                }, '');
                                fs.write(fd, newLine + '\n', err => {if (err) console.warn(err.message)});
                                resolve();
                            }).catch(err => {                         
                                console.log(`Err in getUserById: ${uid} ${err.message}`)
                                reject(err);
                        });
                    }));
                }
            }
            Promise.allSettled(promises).then(() => {
                fs.close(fd, err => {if (err) console.warn(err.message)});
            });            
        });
    });
    console.log(`done getContributions`);
}

if (require.main == module) {
    run();
}