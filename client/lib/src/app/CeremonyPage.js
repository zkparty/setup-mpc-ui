"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  width: 100%;\n  display: inline-block;\n  padding: 16px;\n  box-sizing: border-box;\n"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  width: 512px;\n  background-color: ", ";\n  padding: 16px;\n  border-radius: 4px;\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  width: 512px;\n  background-color: ", ";\n  padding: 16px;\n  border-radius: 4px;\n  text-align: center;\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  display: inline-block;\n  color: ", ";\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  padding: 2px 5px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  position: absolute;\n  top: 16px;\n  left: 16px;\n\n  a {\n    color: ", ";\n\n    &:hover {\n      color: ", ";\n      background-color: ", ";\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  text-align: right;\n  font-size: 11pt;\n  width: 100%;\n\n  td {\n    padding-left: 10px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CeremonyPage = void 0;

var react_router_dom_1 = require("react-router-dom");

var react_1 = require("react");

var React = __importStar(require("react"));

var styled_components_1 = __importDefault(require("styled-components"));

var styles_1 = require("../../styles");

var ZKPartyApi_1 = require("../api/ZKPartyApi");

var CeremonyDetailsTable = styled_components_1.default.table(_templateObject());
var HomeLinkContainer = styled_components_1.default.div(_templateObject2(), styles_1.accentColor, styles_1.textColor, styles_1.secondAccent);
var TableCell = styled_components_1.default.span(_templateObject3());
var TableHeader = styled_components_1.default(TableCell)(_templateObject4(), styles_1.accentColor);
var NotFoundContainer = styled_components_1.default.div(_templateObject5(), styles_1.lighterBackground);
var CeremonyDetailsContainer = styled_components_1.default.div(_templateObject6(), styles_1.lighterBackground);
var CeremonyDetailsSubSection = styled_components_1.default.div(_templateObject7());

exports.CeremonyPage = function () {
  var _react_router_dom_1$u = react_router_dom_1.useParams(),
      id = _react_router_dom_1$u.id;

  var _react_1$useState = react_1.useState(false),
      _react_1$useState2 = (0, _slicedToArray2.default)(_react_1$useState, 2),
      loaded = _react_1$useState2[0],
      setLoaded = _react_1$useState2[1];

  var _react_1$useState3 = react_1.useState(null),
      _react_1$useState4 = (0, _slicedToArray2.default)(_react_1$useState3, 2),
      ceremony = _react_1$useState4[0],
      setCeremony = _react_1$useState4[1];

  var refreshCeremony = function refreshCeremony() {
    ZKPartyApi_1.getCeremonyData(id).then(function (ceremony) {
      setCeremony(ceremony);
    }).catch(function (err) {
      console.error("Error getting ceremony: ".concat(err));
    });
  };

  react_1.useEffect(function () {
    ZKPartyApi_1.getCeremonyDataCached(id).then(function (ceremonyData) {
      setCeremony(ceremonyData);
      setLoaded(true);
      refreshCeremony(); // TODO: clear interval with returned function for useEffect

      setInterval(refreshCeremony, 15000);
    }).catch(function () {
      setLoaded(true);
    });
  }, [loaded]);
  return React.createElement(React.Fragment, null, React.createElement(HomeLinkContainer, null, React.createElement(react_router_dom_1.Link, {
    to: "/"
  }, "home")), ceremony ? React.createElement(styles_1.PageContainer, null, React.createElement("br", null), React.createElement(CeremonyDetails, {
    ceremony: ceremony
  }), React.createElement("br", null), React.createElement(ParticipantTable, {
    participants: ceremony.participants ? ceremony.participants : [],
    headers: [{
      title: "connection",
      width: "100px"
    }, {
      title: "address",
      width: "400px"
    }, {
      title: "status",
      width: "100px"
    }],
    cols: [function (p) {
      return p.online ? "online" : "offline";
    }, function (p) {
      return p.address;
    }, participantStatusString]
  })) : React.createElement(styles_1.PageContainer, null, React.createElement("br", null), React.createElement(NotFoundContainer, null, loaded ? "Ceremony not found." : "Loading...")));
};

var CeremonyDetails = function CeremonyDetails(props) {
  return React.createElement(CeremonyDetailsContainer, null, React.createElement(styles_1.CeremonyTitle, null, props.ceremony.title), React.createElement(CeremonyDetailsSubSection, null, React.createElement(styles_1.Center, null, React.createElement(CeremonyDetailsTable, null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, "status"), React.createElement("td", null, props.ceremony.ceremonyState)), React.createElement("tr", null, React.createElement("td", null, "start time"), React.createElement("td", null, props.ceremony.startTime.toLocaleString())), React.createElement("tr", null, React.createElement("td", null, "end time"), React.createElement("td", null, props.ceremony.endTime.toLocaleString())), React.createElement("tr", null, React.createElement("td", null, "hompage"), React.createElement("td", null, React.createElement("a", {
    href: props.ceremony.homepage
  }, props.ceremony.homepage))), React.createElement("tr", null, React.createElement("td", null, "github"), React.createElement("td", null, React.createElement("a", {
    href: props.ceremony.github
  }, props.ceremony.github))))))), React.createElement(CeremonyDetailsSubSection, null, props.ceremony.description));
};

var participantStatusString = function participantStatusString(participant) {
  var statusString = participant.state;

  if (participant.state === "RUNNING" && participant.computeProgress < 1) {
    statusString = "RUNNING: ".concat(Math.round(participant.computeProgress), "%");
  } else if (participant.state === "RUNNING" && participant.computeProgress === 1) {
    statusString = "VERIFYING";
  }

  return statusString;
};

var ParticipantTable = function ParticipantTable(props) {
  return React.createElement("div", null, React.createElement("br", null), props.headers.map(function (header, i) {
    return React.createElement(TableHeader, {
      key: i,
      style: {
        width: header.width
      }
    }, header.title);
  }), props.participants.map(function (p, j) {
    return React.createElement("div", {
      key: j
    }, props.cols.map(function (col, i) {
      return React.createElement(TableCell, {
        style: {
          width: props.headers[i].width,
          maxWidth: props.headers[i].width,
          overflow: "hidden",
          textOverflow: "ellipses",
          display: "inline-block",
          zIndex: 100,
          position: "relative"
        },
        key: i
      }, col(p) + "");
    }));
  }));
};