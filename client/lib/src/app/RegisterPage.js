"use strict";

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
exports.RegisterPage = void 0;

var styles_1 = require("../../styles");

var react_router_dom_1 = require("react-router-dom");

var React = __importStar(require("react"));

exports.RegisterPage = function () {
  return React.createElement(styles_1.PageContainer, null, "here is where you will register", React.createElement(react_router_dom_1.Link, {
    to: "/"
  }, " home"), React.createElement("br", null), React.createElement("form", null, React.createElement("label", null, "name: ", React.createElement("input", {
    name: "name",
    type: "text"
  })), React.createElement("br", null), React.createElement("label", null, "org: ", React.createElement("input", {
    name: "name",
    type: "text"
  })), React.createElement("br", null), React.createElement("label", null, "email: ", React.createElement("input", {
    name: "name",
    type: "text"
  })), React.createElement("br", null), React.createElement("label", null, "desc: ", React.createElement("input", {
    name: "name",
    type: "text"
  })), React.createElement("br", null), React.createElement("input", {
    type: "submit"
  })));
};