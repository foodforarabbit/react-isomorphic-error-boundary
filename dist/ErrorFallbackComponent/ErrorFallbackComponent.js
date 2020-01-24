"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FallbackErrorComponent = ({
  errorMessage,
  componentName
}) => _react.default.createElement("h1", null, "Something went wrong in--", _react.default.createElement("span", null, componentName), "Component.", _react.default.createElement("p", null, errorMessage));

FallbackErrorComponent.propTypes = {
  errorMessage: _propTypes.default.string,
  componentName: _propTypes.default.string
};
FallbackErrorComponent.defaultProps = {
  errorMessage: '',
  componentName: ''
};
var _default = FallbackErrorComponent;
exports.default = _default;