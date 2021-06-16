"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  body {\n    background-color: #081a24;\n    color: ", ";\n    margin: 0;\n    font-family: 'Inconsolata', monospace;\n    font-size: 11pt;\n  }\n"]);

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

var react_router_dom_1 = require("react-router-dom");

var React = __importStar(require("react"));

var styled_components_1 = require("styled-components");

var styles_1 = require("../../styles");

var LandingPage_1 = require("./LandingPage");

var CeremonyPage_1 = require("./CeremonyPage");

var RegisterPage_1 = require("./RegisterPage");

var App = function App() {
  return React.createElement(react_router_dom_1.HashRouter, null, React.createElement(GlobalStyle, null), React.createElement(react_router_dom_1.Switch, null, React.createElement(react_router_dom_1.Route, {
    exact: true,
    path: "/register"
  }, React.createElement(RegisterPage_1.RegisterPage, null)), React.createElement(react_router_dom_1.Route, {
    exact: true,
    path: "/ceremony/:id"
  }, React.createElement(CeremonyPage_1.CeremonyPage, null)), React.createElement(react_router_dom_1.Route, {
    exact: true,
    path: "/"
  }, React.createElement(LandingPage_1.LandingPage, null))));
};

var GlobalStyle = styled_components_1.createGlobalStyle(_templateObject(), styles_1.textColor);
exports.default = App;