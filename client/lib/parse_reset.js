"use strict";

exports.__esModule = true;

var firebase = require('firebase/app');

var firestore = require('firebase/firestore');

var fs = require('fs');

var FirestoreApi_1 = require("./api/FirestoreApi");

var firebaseConfig_1 = require("./app/firebaseConfig");

var run = function run() {
  firebase.initializeApp(firebaseConfig_1["default"]);
  fs.readFile('//mnt/c/temp/zkopru/reset_list.csv', 'utf8', function (err, data) {
    if (err) {
      console.warn(err.message);
      return;
    }

    var lines = data.split('\n');
    var records = lines.map(function (line) {
      return line.split(',');
    });
    records.forEach(function (record, i) {
      if (i > 0 && record.length >= 4) {
        FirestoreApi_1.resetContrib(record[1], record[3].trim(), parseInt(record[2]));
      }
    });
  });
};

if (require.main == module) {
  run();
}