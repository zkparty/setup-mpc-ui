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

exports.__esModule = true;
exports.resetContrib = exports.extractContribs = exports.getSiteSettings = exports.getUserStatus = exports.resetContributions = exports.countParticipantContributions = exports.getParticipantContributions = exports.addOrUpdateParticipant = exports.addOrUpdateContribution = exports.ceremonyQueueListener = exports.ceremonyQueueListenerUnsub = exports.getContributionState = exports.getNextQueueIndex = exports.joinCircuit = exports.ceremonyContributionListener = exports.contributionUpdateListener = exports.ceremonyUpdateListener = exports.ceremonyListener = exports.circuitEventListener = exports.ceremonyEventListener = exports.addCeremonyEvent = exports.getCeremonyContributions = exports.getCeremonyCount = exports.getCeremonies = exports.getCeremony = exports.updateCeremony = exports.addCeremony = void 0;

var app_1 = require("firebase/app");

require("firebase/firestore");

var ZKPartyApi_1 = require("./ZKPartyApi");

var COMPLETE = "COMPLETE";
var INVALIDATED = "INVALIDATED";
var RUNNING = "RUNNING";
var WAITING = "WAITING";
var PRESELECTION = "PRESELECTION";
var VERIFIED = "VERIFIED";
var VERIFY_FAILED = "VERIFY_FAILED";
var ABORTED = "ABORTED";
var ceremonyConverter = {
  toFirestore: function toFirestore(c) {
    var ceremonyData = c;

    try {
      if (c.startTime) {
        var start = typeof c.startTime === 'string' ? app_1["default"].firestore.Timestamp.fromMillis(Date.parse(c.startTime)) : app_1["default"].firestore.Timestamp.fromDate(c.startTime);
        ceremonyData = __assign(__assign({}, ceremonyData), {
          startTime: start
        });
      }

      if (c.endTime) {
        var end = typeof c.endTime === 'string' ? app_1["default"].firestore.Timestamp.fromMillis(Date.parse(c.endTime)) : app_1["default"].firestore.Timestamp.fromDate(c.endTime);
        ceremonyData = __assign(__assign({}, ceremonyData), {
          endTime: end
        });
      }
    } catch (err) {
      console.error("Unexpected error parsing dates: " + err.message);
    }

    ;
    return __assign(__assign({}, ceremonyData), {
      lastSummaryUpdate: app_1["default"].firestore.Timestamp.now()
    });
  },
  fromFirestore: function fromFirestore(snapshot, options) {
    return ZKPartyApi_1.jsonToCeremony(__assign({
      id: snapshot.id
    }, snapshot.data(options)));
  }
};
var contributionConverter = {
  toFirestore: function toFirestore(c) {
    if (c.status === COMPLETE) {
      c.hash = c.hash || '#error';
    }

    return c;
  },
  fromFirestore: function fromFirestore(snapshot, options) {
    return ZKPartyApi_1.jsonToContribution(snapshot.data(options));
  }
}; //=====================================================================================

function addCeremony(ceremony) {
  return __awaiter(this, void 0, void 0, function () {
    var db, doc, e_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 3,, 4]);

          return [4
          /*yield*/
          , db.collection("ceremonies").withConverter(ceremonyConverter).add(ceremony)];

        case 2:
          doc = _a.sent();
          console.log("new ceremony added with id " + doc.id);
          return [2
          /*return*/
          , doc.id];

        case 3:
          e_1 = _a.sent();
          throw new Error("error adding ceremony data to firebase: " + e_1);

        case 4:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.addCeremony = addCeremony;
;

function updateCeremony(ceremony) {
  return __awaiter(this, void 0, void 0, function () {
    var db, e_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 3,, 4]);

          return [4
          /*yield*/
          , db.collection("ceremonies").withConverter(ceremonyConverter).doc(ceremony.id).set(ceremony, {
            merge: true
          })];

        case 2:
          _a.sent();

          console.debug("ceremony " + ceremony.id + " updated");
          return [3
          /*break*/
          , 4];

        case 3:
          e_2 = _a.sent();
          console.error("ceremony update failed: " + e_2.message);
          throw new Error("error updating ceremony data: " + e_2);

        case 4:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.updateCeremony = updateCeremony;
;

function getCeremony(id) {
  return __awaiter(this, void 0, void 0, function () {
    var db, doc;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          return [4
          /*yield*/
          , db.collection("ceremonies").withConverter(ceremonyConverter).doc(id).get()];

        case 1:
          doc = _a.sent();

          if (doc === undefined) {
            throw new Error("ceremony not found");
          }

          console.log("getCeremony " + doc.exists);
          return [2
          /*return*/
          , doc.data()];
      }
    });
  });
}

exports.getCeremony = getCeremony; // Return all circuits, with summary contrib counts for each

exports.getCeremonies = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, ceremonySnapshot, ceremonies;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          return [4
          /*yield*/
          , db.collection("ceremonies").withConverter(ceremonyConverter).orderBy('sequence').where('ceremonyState', '==', RUNNING).get()];

        case 1:
          ceremonySnapshot = _a.sent();
          return [4
          /*yield*/
          , Promise.all(ceremonySnapshot.docs.map(function (doc) {
            return __awaiter(void 0, void 0, void 0, function () {
              var count, c;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4
                    /*yield*/
                    , getCeremonyStats(doc.ref.id)];

                  case 1:
                    count = _a.sent();
                    c = __assign(__assign({}, doc.data()), count);
                    return [2
                    /*return*/
                    , c];
                }
              });
            });
          }))];

        case 2:
          ceremonies = _a.sent();
          return [2
          /*return*/
          , ceremonies];
      }
    });
  });
}; // Counts the waiting and complete contributions for a circuit


exports.getCeremonyCount = function (ref) {
  return __awaiter(void 0, void 0, void 0, function () {
    var lastVerifiedIndex, transcript, contribQuery, query, complete, waiting;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          lastVerifiedIndex = -1;
          transcript = undefined;
          return [4
          /*yield*/
          , ref.collection('contributions').withConverter(contributionConverter)];

        case 1:
          contribQuery = _a.sent();
          return [4
          /*yield*/
          , contribQuery.where('status', '==', 'COMPLETE').get()];

        case 2:
          query = _a.sent();
          complete = query.size;
          query.forEach(function (snap) {
            var qi = snap.get('queueIndex');
            var tx = snap.get('verification');

            if (tx && qi > lastVerifiedIndex) {
              lastVerifiedIndex = qi;
              transcript = tx;
            }
          });
          return [4
          /*yield*/
          , contribQuery.where('status', '==', 'WAITING').get()];

        case 3:
          query = _a.sent();
          waiting = query.size;
          console.debug("complete " + ref.id + " " + complete);
          return [2
          /*return*/
          , {
            complete: complete,
            waiting: waiting,
            transcript: transcript
          }];
      }
    });
  });
};

function getCeremonyContributions(id) {
  return __awaiter(this, void 0, void 0, function () {
    var db, docSnapshot, contribs;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          return [4
          /*yield*/
          , db.collection("ceremonies").doc(id).collection("contributions").withConverter(contributionConverter).orderBy("timestamp", "desc").get()];

        case 1:
          docSnapshot = _a.sent();
          contribs = docSnapshot.docs.map(function (v) {
            return v.data();
          });
          return [2
          /*return*/
          , contribs];
      }
    });
  });
}

exports.getCeremonyContributions = getCeremonyContributions;

exports.addCeremonyEvent = function (ceremonyId, event) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, doc, e_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 4,, 5]);

          return [4
          /*yield*/
          , db.doc("ceremonies/" + ceremonyId).collection("events").doc()];

        case 2:
          doc = _a.sent();
          return [4
          /*yield*/
          , doc.set(event)];

        case 3:
          _a.sent();

          console.log("added event " + doc.id);
          return [3
          /*break*/
          , 5];

        case 4:
          e_3 = _a.sent();
          console.warn("Error adding event: " + e_3.message);
          return [3
          /*break*/
          , 5];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
};

exports.ceremonyEventListener = function (ceremonyId, callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, query, unsub;
    return __generator(this, function (_a) {
      db = app_1["default"].firestore();
      query = db.collectionGroup("events").where('timestamp', '>', app_1["default"].firestore.Timestamp.now());
      unsub = query.onSnapshot(function (querySnapshot) {
        //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
        querySnapshot.docChanges().forEach(function (docSnapshot) {
          var event = docSnapshot.doc.data();
          var ceremony = docSnapshot.doc.ref.parent.parent; //console.debug(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony?.id}`);

          if ((ceremony === null || ceremony === void 0 ? void 0 : ceremony.id) === ceremonyId) {
            switch (event.eventType) {
              case 'PREPARED':
                {
                  break;
                }

              case 'STATUS_UPDATE':
                {
                  callback(event);
                  break;
                }
            }
          }
        });
      }, function (err) {
        console.warn("Error while listening for ceremony events " + err);
      });
      return [2
      /*return*/
      , unsub];
    });
  });
};
/* Listens for events on all circuits */


exports.circuitEventListener = function (callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, query, unsub;
    return __generator(this, function (_a) {
      db = app_1["default"].firestore();
      query = db.collectionGroup("events").where('timestamp', '>', app_1["default"].firestore.Timestamp.now());
      unsub = query.onSnapshot(function (querySnapshot) {
        //console.debug(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
        querySnapshot.docChanges().forEach(function (docSnapshot) {
          var event = docSnapshot.doc.data();
          var ceremony = docSnapshot.doc.ref.parent.parent; //console.debug(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony?.id}`);

          if (event.eventType === 'VERIFIED') {
            callback(ceremony);
          }
        });
      }, function (err) {
        console.warn("Error while listening for ceremony events " + err);
      });
      return [2
      /*return*/
      , unsub];
    });
  });
}; // Listens for updates to circuit data. Running circuits only.


exports.ceremonyListener = function (callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, query;
    return __generator(this, function (_a) {
      db = app_1["default"].firestore();
      query = db.collectionGroup("ceremonies").withConverter(ceremonyConverter).where('ceremonyState', '==', RUNNING);
      query.onSnapshot(function (querySnapshot) {
        //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
        querySnapshot.docChanges().forEach(function (docSnapshot) {
          return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
              if (docSnapshot.type === 'modified' || docSnapshot.type === 'added') {
                console.debug("Circuit: " + docSnapshot.doc.id);
                getCeremonyStats(docSnapshot.doc.ref.id).then(function (stats) {
                  var ceremony = __assign(__assign({}, docSnapshot.doc.data()), stats);

                  callback(ceremony);
                });
              }

              return [2
              /*return*/
              ];
            });
          });
        });
      }, function (err) {
        console.log("Error while listening for ceremony changes " + err);
      });
      return [2
      /*return*/
      ];
    });
  });
}; // Listens for updates to a ceremony


exports.ceremonyUpdateListener = function (id, callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, ceremonyData;
    return __generator(this, function (_a) {
      db = app_1["default"].firestore();
      ceremonyData = db.collection("ceremonies").withConverter(ceremonyConverter).doc(id);
      return [2
      /*return*/
      , ceremonyData.onSnapshot(function (querySnapshot) {
        var c = querySnapshot.data();
        if (c !== undefined) callback(c);
      }, function (err) {
        console.log("Error while listening for ceremony changes " + err);
      })];
    });
  });
}; // Listens for updates to ceremony contributions


exports.contributionUpdateListener = function (id, callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, query, querySnapshot;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.debug("contributionUpdateListener " + id);
          db = app_1["default"].firestore();
          query = db.collection("ceremonies").doc(id).collection("contributions").withConverter(contributionConverter).orderBy("queueIndex", "asc");
          return [4
          /*yield*/
          , query.get()];

        case 1:
          querySnapshot = _a.sent(); //console.debug(`query snapshot ${querySnapshot.size}`);

          querySnapshot.docs.forEach(function (doc) {
            return callback(doc.data(), 'added');
          });
          return [2
          /*return*/
          , query.onSnapshot(function (querySnapshot) {
            //console.debug(`contribData snapshot ${querySnapshot.size}`);
            querySnapshot.docChanges().forEach(function (contrib) {
              callback(contrib.doc.data(), contrib.type, contrib.oldIndex);
            });
          }, function (err) {
            console.log("Error while listening for ceremony changes " + err);
          })];
      }
    });
  });
}; // Listens for updates to eligible ceremonies that a participant may contribute to.
// The first such ceremony found will be returned in the callback


exports.ceremonyContributionListener = function (participantId, isCoordinator, callback) {
  var setContribution = function setContribution(ceremony, contrib) {
    return __awaiter(void 0, void 0, void 0, function () {
      var cs;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Save the contribution record
            return [4
            /*yield*/
            , exports.addOrUpdateContribution(ceremony.id, contrib)];

          case 1:
            // Save the contribution record
            _a.sent();

            return [4
            /*yield*/
            , exports.getContributionState(ceremony, contrib)];

          case 2:
            cs = _a.sent();
            callback(cs);
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  var checkCeremony = function checkCeremony(ceremonySnapshot) {
    return __awaiter(void 0, void 0, void 0, function () {
      var ceremony, ceremonyId, participantQuery, contSnapshot, contribution, _a, contrib;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            ceremony = ceremonySnapshot.data();
            ceremonyId = ceremonySnapshot.id;
            participantQuery = ceremonySnapshot.ref.collection('contributions').withConverter(contributionConverter).where('participantId', '==', participantId);
            return [4
            /*yield*/
            , participantQuery.get()];

          case 1:
            contSnapshot = _b.sent();
            if (!contSnapshot.empty) return [3
            /*break*/
            , 5];
            if (!!found) return [3
            /*break*/
            , 4];
            found = true;
            console.debug("found ceremony " + ceremonyId + " to contribute to");
            contribution = {
              participantId: participantId,
              status: WAITING,
              lastSeen: new Date(),
              timeAdded: new Date()
            }; // Allocate a position in the queue

            _a = contribution;
            return [4
            /*yield*/
            , exports.getNextQueueIndex(ceremonyId, participantId)];

          case 2:
            // Allocate a position in the queue
            _a.queueIndex = _b.sent();
            return [4
            /*yield*/
            , setContribution(ceremony, contribution)];

          case 3:
            _b.sent();

            return [2
            /*return*/
            , true];

          case 4:
            return [3
            /*break*/
            , 7];

          case 5:
            contrib = contSnapshot.docs[0].data();
            if (!((contrib.status === WAITING || contrib.status === RUNNING) && !found)) return [3
            /*break*/
            , 7]; // Re-use this

            found = true;
            contrib.lastSeen = new Date();
            contrib.status = WAITING;
            return [4
            /*yield*/
            , setContribution(ceremony, contrib)];

          case 6:
            _b.sent();

            return [2
            /*return*/
            , true];

          case 7:
            ;
            return [2
            /*return*/
            , false];
        }
      });
    });
  };

  console.debug("getting contributions for " + participantId);
  var db = app_1["default"].firestore(); // Get running ceremonies
  // Coordinator can contribute to ceremonies even if they're not 
  // past start time

  var states = [RUNNING];
  if (isCoordinator) states.push(PRESELECTION, WAITING);
  var query = db.collection("ceremonies").withConverter(ceremonyConverter).where('ceremonyState', 'in', states).orderBy('sequence', 'asc');
  var found = false;
  var promises = []; // TODO - Review the need for onSnapshot. a get() would probably do the job. 
  // sub/unsub is overkill

  var unsub = query.onSnapshot(function (querySnapshot) {
    querySnapshot.forEach(function (ceremonySnapshot) {
      var p = checkCeremony(ceremonySnapshot);
      promises.push(p);
    });
    Promise.all(promises).then(function (res) {
      if (!found) {
        // Indicate end of run
        callback(false);
      }
    });
  }, function (err) {
    console.log("Error while listening for ceremony changes " + err.message);
  });
  return unsub;
}; // Join this circuit. 


exports.joinCircuit = function (ceremonyId, participantId) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, ceremonySnapshot, ceremony, contSnapshot, contribution, _a, contrib;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          db = app_1["default"].firestore();
          return [4
          /*yield*/
          , db.collection('ceremonies').doc(ceremonyId).withConverter(ceremonyConverter).get()];

        case 1:
          ceremonySnapshot = _b.sent();
          ceremony = ceremonySnapshot.data();

          if (!ceremony) {
            console.error("Ceremony " + ceremonyId + " not found!");
            return [2
            /*return*/
            , undefined];
          }

          return [4
          /*yield*/
          , ceremonySnapshot.ref.collection('contributions').withConverter(contributionConverter).where('participantId', '==', participantId).get()];

        case 2:
          contSnapshot = _b.sent();
          if (!contSnapshot.empty) return [3
          /*break*/
          , 4]; // No prior entries for this participant

          console.debug("ceremony " + ceremonyId + ": new participant");
          contribution = {
            participantId: participantId,
            status: WAITING,
            lastSeen: new Date(),
            timeAdded: new Date()
          }; // Allocate a position in the queue

          _a = contribution;
          return [4
          /*yield*/
          , exports.getNextQueueIndex(ceremonyId, participantId)];

        case 3:
          // Allocate a position in the queue
          _a.queueIndex = _b.sent();
          return [2
          /*return*/
          , setContribution(ceremony, contribution)];

        case 4:
          contrib = contSnapshot.docs[0].data();

          if (contrib.status === WAITING || contrib.status === RUNNING) {
            // Re-use this
            console.log("Reusing contrib " + contrib.queueIndex);
            contrib.lastSeen = new Date();
            contrib.status = WAITING;
            return [2
            /*return*/
            , setContribution(ceremony, contrib)];
          } else {
            // Either COMPLETE or INVALIDATED - skip this circuit
            console.log("Participant has already attempted " + ceremonyId);
            return [2
            /*return*/
            , undefined];
          }

          _b.label = 5;

        case 5:
          ;
          return [2
          /*return*/
          ];
      }
    });
  });
};

var setContribution = function setContribution(ceremony, contrib) {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Save the contribution record
          return [4
          /*yield*/
          , exports.addOrUpdateContribution(ceremony.id, contrib)];

        case 1:
          // Save the contribution record
          _a.sent();

          return [2
          /*return*/
          , exports.getContributionState(ceremony, contrib)];
      }
    });
  });
};

exports.getNextQueueIndex = function (ceremonyId, participantId) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, query, snapshot, cont;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          query = db.collection("ceremonies").doc(ceremonyId).collection('contributions').withConverter(contributionConverter).orderBy('queueIndex', 'desc');
          return [4
          /*yield*/
          , query.get()];

        case 1:
          snapshot = _a.sent();

          if (snapshot.empty) {
            return [2
            /*return*/
            , 1];
          } else {
            cont = snapshot.docs[0].data();
            return [2
            /*return*/
            , cont.queueIndex ? cont.queueIndex + 1 : 1];
          }

          return [2
          /*return*/
          ];
      }
    });
  });
};

exports.getContributionState = function (ceremony, contribution) {
  return __awaiter(void 0, void 0, void 0, function () {
    var contState, stats, estStartTime, cs;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          contState = {
            ceremony: ceremony,
            participantId: contribution.participantId,
            queueIndex: contribution.queueIndex ? contribution.queueIndex : 1
          };
          return [4
          /*yield*/
          , getCeremonyStats(ceremony.id)];

        case 1:
          stats = _a.sent();
          estStartTime = Date.now() + 1000 * ((contState.queueIndex - stats.currentIndex) * stats.averageSecondsPerContribution);
          cs = __assign(__assign({}, contState), {
            status: WAITING,
            currentIndex: stats.currentIndex,
            lastValidIndex: stats.lastValidIndex,
            averageSecondsPerContribution: stats.averageSecondsPerContribution,
            expectedStartTime: estStartTime
          });
          return [2
          /*return*/
          , cs];
      }
    });
  });
};

var getCeremonyStats = function getCeremonyStats(ceremonyId) {
  return __awaiter(void 0, void 0, void 0, function () {
    var contributionStats, totalSecs, numContribs, db, ceremony, query, ceremonySnap, snapshot;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          contributionStats = {
            currentIndex: 0,
            averageSecondsPerContribution: 0,
            lastValidIndex: 0,
            complete: 0,
            waiting: 0,
            transcript: ''
          };
          totalSecs = 0;
          numContribs = 0;
          db = app_1["default"].firestore();
          ceremony = db.collection("ceremonies").doc(ceremonyId);
          query = ceremony.collection('contributions').withConverter(contributionConverter).orderBy('queueIndex', 'asc');
          return [4
          /*yield*/
          , ceremony.get()];

        case 1:
          ceremonySnap = _a.sent();
          return [4
          /*yield*/
          , query.get()];

        case 2:
          snapshot = _a.sent();
          snapshot.forEach(function (docSnapshot) {
            var cont = docSnapshot.data();

            if (cont.status === COMPLETE || cont.status === INVALIDATED || cont.status === RUNNING) {
              if (cont.queueIndex) {
                contributionStats.currentIndex = cont.queueIndex;

                if (cont.status === COMPLETE && cont.verification) {
                  contributionStats.lastValidIndex = cont.queueIndex;
                  contributionStats.transcript = cont.verification;
                }
              }

              if (cont.status === COMPLETE && cont.duration) {
                numContribs++;
                totalSecs += cont.duration;
              }
            } else if (cont.status === WAITING) {
              contributionStats.waiting++;
            }
          });
          contributionStats.averageSecondsPerContribution = numContribs > 0 ? Math.floor(totalSecs / numContribs) : ceremonySnap.get('numConstraints') * 5 / 1000; // calc sensible default based on circuit size

          contributionStats.complete = numContribs;
          return [2
          /*return*/
          , contributionStats];
      }
    });
  });
}; // Listens for circuit events, to track progress


exports.ceremonyQueueListener = function (ceremonyId, callback) {
  return __awaiter(void 0, void 0, void 0, function () {
    var lastQueueIndex, lastValidIndex, db, query, cs;
    return __generator(this, function (_a) {
      console.log("listening for queue activity for " + ceremonyId);
      lastQueueIndex = 0;
      lastValidIndex = 0;
      db = app_1["default"].firestore();
      query = db.collection("ceremonies").doc(ceremonyId).collection("events").where("eventType", "in", [VERIFIED, VERIFY_FAILED, INVALIDATED, ABORTED]);
      cs = {};
      exports.ceremonyQueueListenerUnsub = query.onSnapshot(function (querySnapshot) {
        //console.debug(`queue listener doc: ${querySnapshot.size}`);
        //let found = false;
        lastQueueIndex = querySnapshot.docs.reduce(function (last, snap) {
          //if (snap.type !== 'removed') {
          var event = snap.data();

          if (event.index && event.index > last) {
            return event.index;
          } else {
            return last;
          } // } else {
          //   return last;
          //}

        }, lastQueueIndex);
        lastValidIndex = querySnapshot.docs.reduce(function (last, snap) {
          //if (snap.type !== 'removed') {
          var event = snap.data();

          if (event.index && event.index > last && event.eventType === VERIFIED) {
            return event.index;
          } else {
            return last;
          } // } else {
          //   return last;
          // }

        }, lastValidIndex); //if (found) {
        //console.debug(`new queue index ${lastQueueIndex+1}`);

        callback({
          currentIndex: lastQueueIndex + 1,
          lastValidIndex: lastValidIndex
        }); //}
      });
      return [2
      /*return*/
      ];
    });
  });
};

exports.addOrUpdateContribution = function (ceremonyId, contribution) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, indexQuery, contrib, doc, doc, oldStatus, e_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!contribution.queueIndex) {
            throw new Error("Attempting to add or update contribution without queueIndex");
          }

          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 9,, 10]);

          indexQuery = db.collection("ceremonies").doc(ceremonyId).collection('contributions').withConverter(contributionConverter).where('queueIndex', '==', contribution.queueIndex).limit(1);
          return [4
          /*yield*/
          , indexQuery.get()];

        case 2:
          contrib = _a.sent();
          if (!contrib.empty) return [3
          /*break*/
          , 5];
          return [4
          /*yield*/
          , db.doc("ceremonies/" + ceremonyId).collection("contributions").withConverter(contributionConverter).doc()];

        case 3:
          doc = _a.sent();
          return [4
          /*yield*/
          , doc.set(contribution)];

        case 4:
          _a.sent();

          console.log("added contribution summary " + doc.id + " for index " + contribution.queueIndex);
          return [3
          /*break*/
          , 8];

        case 5:
          doc = contrib.docs[0];
          oldStatus = doc.get('status');
          if (!(INVALIDATED === oldStatus)) return [3
          /*break*/
          , 6];
          console.warn("Invalid contribution status change: " + oldStatus + " to " + contribution.status + ". Ignored.");
          return [3
          /*break*/
          , 8];

        case 6:
          return [4
          /*yield*/
          , doc.ref.update(contribution)];

        case 7:
          _a.sent();

          _a.label = 8;

        case 8:
          return [3
          /*break*/
          , 10];

        case 9:
          e_4 = _a.sent();
          throw new Error("Error adding/updating contribution summary: " + e_4.message);

        case 10:
          return [2
          /*return*/
          ];
      }
    });
  });
};

exports.addOrUpdateParticipant = function (participant) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, doc, e_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 4,, 5]);

          participant.online = true;
          participant.lastUpdate = new Date();
          participant.authId = participant.authId || 'anonymous';
          return [4
          /*yield*/
          , db.doc("participants/" + participant.uid)];

        case 2:
          doc = _a.sent();
          return [4
          /*yield*/
          , doc.set(participant)];

        case 3:
          _a.sent();

          console.debug("updated participant " + doc.id);
          return [3
          /*break*/
          , 5];

        case 4:
          e_5 = _a.sent();
          console.warn("Error trying to update participant " + e_5.message);
          return [3
          /*break*/
          , 5];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
};

var getParticipantContributionsSnapshot = function getParticipantContributionsSnapshot(participant) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, contribQuery;
    return __generator(this, function (_a) {
      db = app_1["default"].firestore();

      try {
        contribQuery = db.collectionGroup("contributions").withConverter(contributionConverter).where('participantId', '==', participant).where('status', 'in', [COMPLETE, INVALIDATED]);
        return [2
        /*return*/
        , contribQuery.get()];
      } catch (e) {
        throw new Error("Error getting contributions: " + e.message);
      }

      return [2
      /*return*/
      ];
    });
  });
};

exports.getParticipantContributions = function (participant, isCoordinator) {
  if (isCoordinator === void 0) {
    isCoordinator = false;
  }

  return __awaiter(void 0, void 0, void 0, function () {
    var snap, p;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getParticipantContributionsSnapshot(participant)];

        case 1:
          snap = _a.sent();
          p = snap.docs.map(function (cs) {
            return __awaiter(void 0, void 0, void 0, function () {
              var cref, ceremony, cState, states;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    cref = cs.ref.parent.parent;
                    if (!cref) return [3
                    /*break*/
                    , 2];
                    return [4
                    /*yield*/
                    , cref.withConverter(ceremonyConverter).get()];

                  case 1:
                    ceremony = _a.sent();
                    cState = ceremony.get('ceremonyState');
                    states = [RUNNING];
                    if (isCoordinator) states.push(PRESELECTION);

                    if (states.includes(cState)) {
                      return [2
                      /*return*/
                      , __assign({
                        ceremony: ceremony.data()
                      }, cs.data())];
                    } else {
                      return [2
                      /*return*/
                      , null];
                    }

                    _a.label = 2;

                  case 2:
                    return [2
                    /*return*/
                    ];
                }
              });
            });
          });
          return [2
          /*return*/
          , Promise.all(p).then(function (arr) {
            return arr.filter(function (c) {
              return c !== null;
            });
          })];
      }
    });
  });
};

exports.countParticipantContributions = function (participant) {
  return __awaiter(void 0, void 0, void 0, function () {
    var snap;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getParticipantContributionsSnapshot(participant)];

        case 1:
          snap = _a.sent();
          console.debug("count for " + participant + ": " + snap.size);
          return [2
          /*return*/
          , snap.size];
      }
    });
  });
};

exports.resetContributions = function (participant) {
  return __awaiter(void 0, void 0, void 0, function () {
    var count, db, contribSnapshot, e_6;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.debug("resetting contribs for " + participant);
          count = 0;
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 3,, 4]);

          return [4
          /*yield*/
          , db.collectionGroup("contributions").withConverter(contributionConverter).where('participantId', '==', participant).get()];

        case 2:
          contribSnapshot = _a.sent();
          contribSnapshot.forEach(function (doc) {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                doc.ref.set({
                  participantId: "RESET_" + participant.substr(0, 5) + "..."
                }, {
                  merge: true
                });
                count++;
                return [2
                /*return*/
                ];
              });
            });
          });
          console.log("Reset " + count + " contributions");
          return [3
          /*break*/
          , 4];

        case 3:
          e_6 = _a.sent();
          throw new Error("Error resetting contribution: " + e_6.message);

        case 4:
          return [2
          /*return*/
          ];
      }
    });
  });
};

exports.getUserStatus = function (userId) {
  return __awaiter(void 0, void 0, void 0, function () {
    var status, db, userSnapshot, err_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // userId will contain user Id (e.g. github email) // TODO: , or a signature)
          // If userId is an entry in the coordinators collection, they have coord privs.
          console.log(userId);
          status = 'USER';
          console.debug("status for " + userId);
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 3,, 4]);

          return [4
          /*yield*/
          , db.doc("coordinators/" + userId).get()];

        case 2:
          userSnapshot = _a.sent();

          if (userSnapshot.exists) {
            status = 'COORDINATOR';
          }

          return [3
          /*break*/
          , 4];

        case 3:
          err_1 = _a.sent();
          console.warn("Error getting user status: " + err_1.message);
          return [3
          /*break*/
          , 4];

        case 4:
          // if (status === 'USER' && userId.signature) {
          //   // ecrecover signature. Compare to configured admin address
          //   const adminAddress = process.env.ADMIN_ADDRESS;
          // };
          return [2
          /*return*/
          , status];
      }
    });
  });
};

exports.getSiteSettings = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, snapshot, err_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          _a.label = 1;

        case 1:
          _a.trys.push([1, 3,, 4]);

          return [4
          /*yield*/
          , db.doc("settings/site").get()];

        case 2:
          snapshot = _a.sent();
          return [2
          /*return*/
          , snapshot.data()];

        case 3:
          err_2 = _a.sent();
          console.warn("Error getting site settings: " + err_2.message);
          return [3
          /*break*/
          , 4];

        case 4:
          return [2
          /*return*/
          ];
      }
    });
  });
};

exports.extractContribs = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, snap;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          return [4
          /*yield*/
          , db.collectionGroup('contributions').withConverter(contributionConverter).get()];

        case 1:
          snap = _a.sent();
          return [2
          /*return*/
          , snap.docs];
      }
    });
  });
};

exports.resetContrib = function (circuitId, participantId, idx) {
  return __awaiter(void 0, void 0, void 0, function () {
    var db, contrib;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          db = app_1["default"].firestore();
          return [4
          /*yield*/
          , db.collection('ceremonies').doc(circuitId).collection('contributions').withConverter(ceremonyConverter).where('participantId', '==', participantId).where('status', '!=', 'WAITING').get()];

        case 1:
          contrib = _a.sent();

          if (contrib.empty) {
            console.log("Contrib for " + participantId + " not found in " + circuitId);
          } else if (contrib.size > 1) {
            console.log("Duplicate Contrib for " + participantId + " found in " + circuitId);
          } else if (contrib.docs[0].get('queueIndex') !== idx) {
            console.warn("index mismatch for " + participantId + " not found in " + circuitId + " " + contrib.docs[0].get('queueIndex') + " expected " + idx + " ");
          } else {
            contrib.docs[0].ref.update({
              participantId: "RESET_" + participantId + " ",
              status: 'INVALIDATED'
            });
          }

          return [2
          /*return*/
          ];
      }
    });
  });
};