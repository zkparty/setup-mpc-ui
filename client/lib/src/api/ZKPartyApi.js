"use strict";

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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCeremonyData = exports.getCeremonyDataCached = exports.getCeremonySummaries = exports.getCeremonySummariesCached = void 0;
var url = process.env.API_URL ? process.env.API_URL : "http://localhost:80";

function getCeremonySummariesCached() {
  // throws if fetch error
  return fetch("".concat(url, "/api/ceremonies-cached")).then(function (response) {
    return response.json();
  }).then(function (json) {
    return json.map(jsonToCeremony);
  }).catch(function (err) {
    console.error("Error occurred fetching ceremonies: " + err);
    throw err;
  });
}

exports.getCeremonySummariesCached = getCeremonySummariesCached;

function getCeremonySummaries() {
  // throws if fetch error
  return fetch("".concat(url, "/api/ceremonies")).then(function (response) {
    return response.json();
  }).then(function (json) {
    return json.map(jsonToCeremony);
  }).catch(function (err) {
    console.error("Error occurred fetching ceremonies: " + err);
    throw err;
  });
}

exports.getCeremonySummaries = getCeremonySummaries;

function getCeremonyDataCached(id) {
  // throws if fetch error
  return fetch("".concat(url, "/api/ceremony-cached/").concat(id)).then(function (response) {
    if (response.status === 404) {
      return null;
    }

    return response.json();
  }).then(function (json) {
    if (!json) {
      return null;
    }

    return jsonToCeremony(json);
  }).catch(function (err) {
    console.error("Error occurred fetching ceremony: " + err);
    throw err;
  });
}

exports.getCeremonyDataCached = getCeremonyDataCached;

function getCeremonyData(id) {
  // throws if fetch error
  return fetch("".concat(url, "/api/ceremony/").concat(id)).then(function (response) {
    if (response.status === 404) {
      return null;
    }

    return response.json();
  }).then(function (json) {
    if (!json) {
      return null;
    }

    return jsonToCeremony(json);
  }).catch(function (err) {
    console.error("Error occurred fetching ceremony: " + err);
    throw err;
  });
}

exports.getCeremonyData = getCeremonyData;

function jsonToCeremony(json) {
  // throws if ceremony is malformed
  var lastParticipantsUpdate = json.lastParticipantsUpdate,
      lastSummaryUpdate = json.lastSummaryUpdate,
      startTime = json.startTime,
      endTime = json.endTime,
      completedAt = json.completedAt,
      participants = json.participants,
      rest = __rest(json, ["lastParticipantsUpdate", "lastSummaryUpdate", "startTime", "endTime", "completedAt", "participants"]);

  return Object.assign(Object.assign({}, rest), {
    lastParticipantsUpdate: new Date(Date.parse(lastParticipantsUpdate)),
    lastSummaryUpdate: new Date(Date.parse(lastSummaryUpdate)),
    startTime: new Date(Date.parse(startTime)),
    endTime: new Date(Date.parse(endTime)),
    completedAt: completedAt ? new Date(Date.parse(completedAt)) : undefined,
    participants: participants ? participants.map(function (_a) {
      var addedAt = _a.addedAt,
          startedAt = _a.startedAt,
          completedAt = _a.completedAt,
          lastVerified = _a.lastVerified,
          lastUpdate = _a.lastUpdate,
          rest = __rest(_a, ["addedAt", "startedAt", "completedAt", "lastVerified", "lastUpdate"]);

      return Object.assign(Object.assign({}, rest), {
        addedAt: new Date(Date.parse(addedAt)),
        startedAt: startedAt ? new Date(Date.parse(startedAt)) : undefined,
        completedAt: completedAt ? new Date(Date.parse(completedAt)) : undefined,
        lastUpdate: lastUpdate ? new Date(Date.parse(lastUpdate)) : undefined,
        lastVerified: lastVerified ? new Date(Date.parse(lastVerified)) : undefined
      });
    }) : undefined
  });
}