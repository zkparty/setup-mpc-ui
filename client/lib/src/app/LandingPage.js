"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  font-size: 50pt;\n  margin-bottom: 32px;\n  font-weight: bold;\n  color: ", ";\n  cursor: pointer;\n  user-select: none;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  background-color: ", ";\n  margin: 10px;\n  width: 512px;\n  padding: 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  border: 2px solid transparent;\n\n  &:hover {\n    border: 2px solid ", ";\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n      text-decoration: ", ";\n      cursor: pointer;\n      color: ", ";\n      background-color: ", ";\n      margin-right: 16px;\n\n      &:hover {\n        background-color: ", ";\n        color: ", ";\n      }\n    "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  ", "\n"]);

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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LandingPage = void 0;

var react_router_dom_1 = require("react-router-dom");

var react_1 = require("react");

var React = __importStar(require("react"));

var styled_components_1 = __importStar(require("styled-components"));

var styles_1 = require("../../styles");

var ZKPartyApi_1 = require("../api/ZKPartyApi");

var timeago_js_1 = require("timeago.js");

var TabLink = styled_components_1.default.span(_templateObject(), function (props) {
  return styled_components_1.css(_templateObject2(), props.selected ? "underline" : "none", props.selected ? "black" : styles_1.accentColor, props.selected ? styles_1.accentColor : "unset", styles_1.secondAccent, styles_1.textColor);
});
var CeremonyContainer = styled_components_1.default.div(_templateObject3(), styles_1.lighterBackground, styles_1.secondAccent);
var LandingPageTitle = styled_components_1.default.div(_templateObject4(), styles_1.accentColor);

exports.LandingPage = function () {
  return React.createElement(styles_1.PageContainer, null, React.createElement(ZKTitle, null, "zkparty"), React.createElement(Tabs, {
    titles: ["Ceremonies", "Coordinators", "About"]
  }, [React.createElement(ParticipantsSection, {
    key: "participants"
  }), React.createElement(CoordinatorsSection, {
    key: "coordinators"
  }), React.createElement(AboutSection, {
    key: "about"
  })]));
};

var Tabs = function Tabs(props) {
  var _react_1$useState = react_1.useState(0),
      _react_1$useState2 = (0, _slicedToArray2.default)(_react_1$useState, 2),
      selectedTitleIndex = _react_1$useState2[0],
      updateIndex = _react_1$useState2[1];

  return React.createElement(React.Fragment, null, React.createElement("div", null, props.titles.map(function (title, i) {
    return React.createElement("span", {
      key: title,
      onClick: function onClick() {
        return updateIndex(i);
      }
    }, React.createElement(TabLink, {
      selected: i === selectedTitleIndex
    }, title));
  })), React.createElement(styles_1.SectionContainer, null, props.children[selectedTitleIndex]));
};

var ParticipantsSection = function ParticipantsSection() {
  var _react_1$useState3 = react_1.useState([]),
      _react_1$useState4 = (0, _slicedToArray2.default)(_react_1$useState3, 2),
      ceremonies = _react_1$useState4[0],
      setCeremonies = _react_1$useState4[1];

  var _react_1$useState5 = react_1.useState(false),
      _react_1$useState6 = (0, _slicedToArray2.default)(_react_1$useState5, 2),
      loaded = _react_1$useState6[0],
      setLoaded = _react_1$useState6[1];

  var refreshCeremonySummaries = function refreshCeremonySummaries() {
    ZKPartyApi_1.getCeremonySummaries().then(function (ceremonies) {
      setCeremonies(ceremonies);
    }).catch(function (err) {
      console.error("Error getting ceremonies: ".concat(err));
    });
  };

  react_1.useEffect(function () {
    ZKPartyApi_1.getCeremonySummariesCached().then(function (ceremonies) {
      setCeremonies(ceremonies);
      setLoaded(true);
      refreshCeremonySummaries(); // TODO: clear interval with returned function for useEffect

      setInterval(refreshCeremonySummaries, 15000);
    }).catch(function () {
      setLoaded(true);
    });
  }, [loaded]);
  return React.createElement(React.Fragment, null, ceremonies.map(function (c, i) {
    return React.createElement(CeremonySummary, {
      key: i,
      ceremony: c
    });
  }));
};

var CoordinatorsSection = function CoordinatorsSection() {
  return React.createElement("div", {
    style: {
      width: "512px"
    }
  }, "Welcome to zkparty. This page will allow MPC coordinators to register/list their ceremonies, and verify their identities. ", React.createElement("br", null));
};

var AboutSection = function AboutSection() {
  return React.createElement("div", null, "this is the about");
};

var CeremonySummary = function CeremonySummary(props) {
  var c = props.ceremony;
  var history = react_router_dom_1.useHistory();

  var onClick = function onClick() {
    history.push("/ceremony/".concat(c.id));
  };

  return React.createElement(CeremonyContainer, {
    onClick: onClick
  }, React.createElement(styles_1.CeremonyTitle, null, c.title), "STATUS: ".concat(c.ceremonyState) + (c.ceremonyState === "RUNNING" ? " (".concat(c.ceremonyProgress, "%)") : ""), React.createElement("br", null), React.createElement("br", null), c.description, React.createElement("br", null), React.createElement("br", null), "Last updated: ".concat(timeago_js_1.format(c.lastSummaryUpdate)));
};

var ZKTitle = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2.default)(ZKTitle, _React$Component);

  var _super = _createSuper(ZKTitle);

  function ZKTitle() {
    var _this;

    (0, _classCallCheck2.default)(this, ZKTitle);
    _this = _super.apply(this, arguments);
    _this.refreshInterval = 1000 / 12;
    _this.secondsOfLit = 0.5;
    _this.interval = null;
    _this.state = {
      actualText: "zkparty"
    };

    _this.onClick = function () {
      if (_this.interval == null) {
        _this.interval = setInterval(function () {
          _this.setState({
            actualText: _this.getRandomText()
          });
        }, _this.refreshInterval);
        setTimeout(function () {
          clearInterval(_this.interval);
          _this.interval = null;

          if (Math.random() < 0.3) {
            _this.setState({
              actualText: "zkparty"
            });
          }
        }, _this.secondsOfLit * 1000);
      }
    };

    return _this;
  }

  (0, _createClass2.default)(ZKTitle, [{
    key: "getRandomText",
    value: function getRandomText() {
      var result = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < "zkparty".length; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
      }

      return result;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(LandingPageTitle, {
        onClick: this.onClick
      }, this.state.actualText);
    }
  }]);
  return ZKTitle;
}(React.Component);