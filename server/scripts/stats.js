/* Generate stats of all vs valid contributions by time added. */
const fs = require('fs');
const reader = require('buffered-reader');

const CCT_PREFIX = 'qvt32';
const CCT_NUM = '01';

const run = () => {
    // Read circuitxx_data.csv. 
    const verifMap = new Map();

    const readVerif = () => {
        let vList = [];

        // Read verification log
        new reader.DataReader (`circuit${CCT_NUM}_data.csv`, { encoding: "utf8" })
            .on ("error", function (error){
                console.log ("error: " + error);
            })
            .on ("line", function (line){
                const fields = line.split(',');
                //console.log ("line: " + line);
                const queueIndex = fields[0];
                //const priorIdx = fields[1];
                const uid = fields[2];
                const completed = fields[5];
                const added = fields[6];
                // status

                if (queueIndex > 1) {
                    const indices = verifMap.get(uid);
                    const isAccepted = !!indices;
                    // calculate nearest hour
                    const timeSlot = Math.floor(added / 3600000) * 3600000;
                    // calculate wait time
                    const waitTime = isAccepted ? completed - added : undefined;
                    vList.push({ queueIndex, uid, timeSlot, completed: isAccepted ? completed : undefined, isAccepted, waitTime });
                }
            })
            .on ("end", function (){
                console.log ("EOF");
                let timeSlots = [];
                // sort by time slot
                vList = vList.sort((a, b) => a.timeSlot > b.timeSlot);
                // reduce to time slot stats
                vList.reduce(( previous, curr ) => {
                    let slot = previous;
                    if (curr.timeSlot > previous.timeSlot) {
                        if (previous.timeSlot >= 0) timeSlots.push(previous);
                        slot = { timeSlot: curr.timeSlot, count: 0, countAccepted: 0, maxWait: -1 };
                    }
                    slot.count++;
                    if (curr.isAccepted) {
                        slot.countAccepted++;
                        if (slot.maxWait < curr.waitTime) slot.maxWait = curr.waitTime;
                    }
                    return slot;
                }, {timeSlot: -1, count: 0, countAccepted: 0, maxWait: -1});
                // write the output
                fs.open(`stats_c${CCT_NUM}.csv`, 'w', (err, fd) => {
                    if (err)  throw err;
                    
                    timeSlots.forEach(e => {
                        console.log(`${e.timeSlot} : ${e.count}, ${e.countAccepted}, ${e.maxWait}`);
                        fs.write(fd, Buffer.from(`${e.timeSlot},${e.count},${e.countAccepted},${e.maxWait}\n`), (err) => {if (err) throw err;});
                    });
                })
            })
            .read ();
    };

    new reader.DataReader (`verified_c${CCT_NUM}.csv`, { encoding: "utf8" })
    .on ("error", function (error){
        console.log ("error: " + error);
    })
    .on ("line", function (line){
        const fields = line.split(',');
        verifMap.set(fields[1],{index: fields[0], qIndex: fields[2]});
    })
    .on ("end", function (){
        console.log ("EOF verif");
        readVerif();
    })
    .read();


}

if (require.main == module) {
    run();
}