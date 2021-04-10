const fs = require('fs');
const { resetContrib } = require('./FirebaseApi');

const run = () => {

    fs.readFile('//mnt/c/temp/zkopru/reset_waiting.csv', 'utf8', (err, data) => {
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
