"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  font-size: 18pt;\n  margin-bottom: 8px;\n  color: ", ";\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 100%;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  margin-top: 32px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  display: flex;\n  width: 100vw;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  margin-top: 64px;\n  margin-bottom: 64px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CeremonyTitle = exports.Center = exports.SectionContainer = exports.PageContainer = exports.secondAccent = exports.accentColor = exports.textColor = exports.lighterBackground = exports.background = void 0;

var color_1 = __importDefault(require("color"));

var styled_components_1 = __importDefault(require("styled-components"));

exports.background = "#081a24";
exports.lighterBackground = color_1.default(exports.background).lighten(0.6).toString();
exports.textColor = "#aaa";
exports.accentColor = "#31c41d";
exports.secondAccent = "#731dc4";
exports.PageContainer = styled_components_1.default.div(_templateObject());
exports.SectionContainer = styled_components_1.default.div(_templateObject2());
exports.Center = styled_components_1.default.div(_templateObject3());
exports.CeremonyTitle = styled_components_1.default.div(_templateObject4(), exports.accentColor);