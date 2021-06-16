"use strict";

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

exports.__esModule = true;

var FirestoreApi_1 = require("./api/FirestoreApi");

var firebase = require('firebase/app');

var firestore = require('firebase/firestore');

var fs = require('fs');

var firebaseConfig_1 = require("./app/firebaseConfig");

var run = function run() {
  firebase.initializeApp(firebaseConfig_1["default"]);
  FirestoreApi_1.extractContribs().then(function (docs) {
    var contribOut = docs.map(function (e) {
      var _a, _b, _c;

      var circuitId = (_c = (_b = (_a = e.ref) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.id;

      var cs = __assign({
        circuitId: circuitId
      }, e.data());

      return cs;
    });
    var contribDocs = JSON.stringify(contribOut);
    fs.writeFile("./contributions.json", contribDocs, function (err) {
      if (err) console.warn(err.message);
    });
  });
};

if (require.main == module) {
  run();
}