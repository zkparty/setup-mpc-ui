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

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};

  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  }

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

exports.__esModule = true;
exports.createSummaryGist = exports.createGist = exports.jsonToContribution = exports.jsonToCeremony = exports.addCeremony = exports.getCeremonyData = exports.getCeremonyDataCached = exports.getCeremonySummaries = exports.getCeremonySummariesCached = void 0;

var FirestoreApi_1 = require("./FirestoreApi");

require('dotenv').config();

var url = process.env.API_URL ? process.env.API_URL : "http://localhost:80";

function getCeremonySummariesCached() {
  // throws if fetch error
  return fetch(url + "/api/ceremonies-cached").then(function (response) {
    return response.json();
  }).then(function (json) {
    return json.map(jsonToCeremony);
  })["catch"](function (err) {
    console.error("Error occurred fetching ceremonies: " + err);
    throw err;
  });
}

exports.getCeremonySummariesCached = getCeremonySummariesCached;

function getCeremonySummaries() {
  // throws if fetch error
  return fetch(url + "/api/ceremonies").then(function (response) {
    return response.json();
  }).then(function (json) {
    return json.map(jsonToCeremony);
  })["catch"](function (err) {
    console.error("Error occurred fetching ceremonies: " + err);
    throw err;
  });
}

exports.getCeremonySummaries = getCeremonySummaries;

function getCeremonyDataCached(id) {
  // throws if fetch error
  return fetch(url + "/api/ceremony-cached/" + id).then(function (response) {
    if (response.status === 404) {
      return null;
    }

    return response.json();
  }).then(function (json) {
    if (!json) {
      return null;
    }

    return jsonToCeremony(json);
  })["catch"](function (err) {
    console.error("Error occurred fetching ceremony: " + err);
    throw err;
  });
}

exports.getCeremonyDataCached = getCeremonyDataCached;

function getCeremonyData(id) {
  // throws if fetch error
  return fetch(url + "/api/ceremony/" + id).then(function (response) {
    if (response.status === 404) {
      return null;
    }

    return response.json();
  }).then(function (json) {
    if (!json) {
      return null;
    }

    return jsonToCeremony(json);
  })["catch"](function (err) {
    console.error("Error occurred fetching ceremony: " + err);
    throw err;
  });
}

exports.getCeremonyData = getCeremonyData;
;

function addCeremony(ceremony) {
  return FirestoreApi_1.addCeremony(ceremony); // throws if fetch error
  // return fetch(`${url}/api/add-ceremony`, {
  //   method: "post",
  //   body: JSON.stringify(ceremony),
  //   headers: { "Content-Type": "application/json" }
  // })
  //   .then(response => {
  //     return response.json();
  //   })
  //   .then(json => {
  //     return json.id;
  //   })
  //   .catch(err => {
  //     throw err;
  //   });
}

exports.addCeremony = addCeremony;
;

var tryDate = function tryDate(d, defaultResult) {
  if (!d) return defaultResult;

  try {
    return d.toDate();
  } catch (e) {
    console.warn("Error converting firebase date " + e.message);
    return defaultResult;
  }
};

function jsonToCeremony(json) {
  // throws if ceremony is malformed
  var lastSummaryUpdate = json.lastSummaryUpdate,
      startTime = json.startTime,
      endTime = json.endTime,
      completedAt = json.completedAt,
      participants = json.participants,
      rest = __rest(json, ["lastSummaryUpdate", "startTime", "endTime", "completedAt", "participants"]); //const start: firebase.firestore.Timestamp = startTime;


  try {
    var c = __assign(__assign({}, rest), {
      lastSummaryUpdate: tryDate(lastSummaryUpdate),
      startTime: tryDate(startTime, new Date()),
      endTime: tryDate(endTime)
    });

    return c;
  } catch (e) {
    console.warn("Error converting ceremony: " + e.message);
    throw e;
  }
}

exports.jsonToCeremony = jsonToCeremony;

exports.jsonToContribution = function (json) {
  try {
    return __assign({}, json);
  } catch (err) {
    console.error("Error converting contrib: " + err.message);
    throw err;
  }
}; // Create a gist to record a contribution


exports.createGist = function (ceremonyId, ceremonyTitle, index, hash, authToken) {
  return __awaiter(void 0, void 0, void 0, function () {
    var summary;
    return __generator(this, function (_a) {
      summary = {
        ceremony: ceremonyTitle,
        ceremonyId: ceremonyId,
        time: new Date(),
        contributionNumber: index,
        hash: hash
      };
      return [2
      /*return*/
      , addGist(JSON.stringify(summary, undefined, 2), 'zkparty phase2 tusted setup MPC contribution summary', authToken)];
    });
  });
};

var addGist = function addGist(summary, description, authToken) {
  return __awaiter(void 0, void 0, void 0, function () {
    var gist, res;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          gist = {
            description: description,
            public: true,
            files: {
              "attestation.txt": {
                content: summary
              }
            }
          };
          return [4
          /*yield*/
          , fetch('https://api.github.com/gists', {
            method: 'post',
            body: JSON.stringify(gist),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': "bearer " + authToken
            }
          })["catch"](function (err) {
            return console.warn("Error creating gist. " + err.message);
          })];

        case 1:
          res = _a.sent();
          if (!res) return [3
          /*break*/
          , 3];
          return [4
          /*yield*/
          , res.json()];

        case 2:
          return [2
          /*return*/
          , _a.sent().html_url];

        case 3:
          return [2
          /*return*/
          , ''];
      }
    });
  });
};

exports.createSummaryGist = function (settings, userContributions, username, authToken) {
  return __awaiter(void 0, void 0, void 0, function () {
    var EOL, template, body, ts, content, description;
    return __generator(this, function (_a) {
      EOL = '\n';
      template = settings.gistTemplate.replaceAll('{EOL}', EOL);
      body = '';
      userContributions.map(function (c) {
        body += "Circuit: " + c.ceremony.title + " \n          Contributor # " + c.queueIndex + "\n          Hash: " + c.hash + "\n\n";
      });
      ts = new Date().toUTCString();
      content = template.replace('{BODY}', body).replace('{TIMESTAMP}', ts).replace('{USERID}', username);
      description = settings.gistSummaryDescription;
      return [2
      /*return*/
      , addGist(content, description, authToken)];
    });
  });
};