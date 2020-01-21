"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SafeComponent = exports.nonFunctionalSafeComponent = exports.wrapMethod = exports.functionalSafeComponent = exports.renderClientSafeComponent = exports.RenderErrorComponent = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _errorLogger = _interopRequireDefault(require("../errorLogger"));

var _ErrorFallbackComponent = _interopRequireDefault(require("../ErrorFallbackComponent/ErrorFallbackComponent"));

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const RenderErrorComponent = ({
  error,
  componentName,
  CustomErrorComponent
}) => {
  return _react.default.createElement('div', {
    className: _config.DEFAULT_CLASS_NAME
  }, _react.default.createElement(CustomErrorComponent || _ErrorFallbackComponent.default, {
    errorMessage: error.message,
    componentName
  }));
};

exports.RenderErrorComponent = RenderErrorComponent;

const renderClientSafeComponent = (renderComponent, componentName, loggerService) => {
  return class ErrorBoundary extends _react.default.Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
        error: null
      };
      this.componentName = componentName;
    }

    static getDerivedStateFromError(error) {
      return {
        hasError: true,
        error
      };
    }

    componentDidCatch(error, errorInfo) {
      (loggerService || _errorLogger.default)({
        error,
        errorInfo
      });
    }

    render() {
      return renderComponent(this.props, this.state);
    }

  };
};

exports.renderClientSafeComponent = renderClientSafeComponent;

const functionalSafeComponent = (WrappedComponent, CustomErrorComponent, loggerService) => {
  const renderComponent = (passedProps, passedState) => {
    try {
      const {
        hasError,
        error
      } = passedState;
      return hasError ? RenderErrorComponent({
        error,
        componentName: WrappedComponent.name,
        CustomErrorComponent
      }) : WrappedComponent(passedProps);
    } catch (err) {
      (loggerService || _errorLogger.default)({
        error: err,
        errorInfo: WrappedComponent.name
      });

      return RenderErrorComponent({
        error: err,
        componentName: WrappedComponent.name,
        CustomErrorComponent
      });
    }
  };

  return renderClientSafeComponent(renderComponent, WrappedComponent.name, loggerService);
};

exports.functionalSafeComponent = functionalSafeComponent;

const wrapMethod = (methodName, WrappedComponent, CustomErrorComponent, loggerService) => {
  const originalMethod = WrappedComponent.prototype[methodName];

  if (!originalMethod) {
    return;
  }

  WrappedComponent.prototype.state = _objectSpread({
    hasError: false,
    error: null
  }, WrappedComponent.prototype.state);

  WrappedComponent.prototype[methodName] = function _componentMethod() {
    try {
      if (methodName === _config.RENDER_METHOD_NAME) {
        const {
          hasError,
          error
        } = this.state;
        return hasError ? RenderErrorComponent({
          error,
          componentName: WrappedComponent.name,
          CustomErrorComponent
        }) : originalMethod.apply(this, arguments);
      }

      return originalMethod.apply(this, arguments);
    } catch (err) {
      (loggerService || _errorLogger.default)({
        error: err,
        errorInfo: WrappedComponent.name
      });

      if (methodName === _config.RENDER_METHOD_NAME) {
        return RenderErrorComponent({
          error: err,
          componentName: WrappedComponent.name,
          CustomErrorComponent
        });
      }

      if (methodName === _config.SHOULD_COMPONENT_UPDATE_METHOD_NAME) {
        return false;
      }

      return false;
    }
  };
};

exports.wrapMethod = wrapMethod;

const nonFunctionalSafeComponent = (WrappedComponent, CustomErrorComponent, loggerService) => {
  _config.LIFECYCLE_METHODS.forEach(method => wrapMethod(method, WrappedComponent, CustomErrorComponent, loggerService));

  const renderComponent = passedProps => _react.default.createElement(WrappedComponent, passedProps);

  return renderClientSafeComponent(renderComponent, WrappedComponent.name, loggerService);
};

exports.nonFunctionalSafeComponent = nonFunctionalSafeComponent;

const SafeComponent = (WrappedComponent, CustomErrorComponent, loggerService) => !WrappedComponent.prototype[_config.RENDER_METHOD_NAME] ? functionalSafeComponent(WrappedComponent, CustomErrorComponent, loggerService) : nonFunctionalSafeComponent(WrappedComponent, CustomErrorComponent, loggerService);

exports.SafeComponent = SafeComponent;
RenderErrorComponent.propTypes = {
  error: _propTypes.default.shape([]),
  componentName: _propTypes.default.string,
  CustomErrorComponent: _propTypes.default.shape({})
};
RenderErrorComponent.defaultProps = {
  error: {},
  componentName: _config.DEFAULT_COMPONENT_NAME,
  CustomErrorComponent: null
};
var _default = SafeComponent;
exports.default = _default;