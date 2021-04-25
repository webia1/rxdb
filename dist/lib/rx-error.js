"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newRxError = newRxError;
exports.newRxTypeError = newRxTypeError;
exports.isPouchdbConflictError = isPouchdbConflictError;
exports.RxTypeError = exports.RxError = void 0;

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _overwritable = require("./overwritable");

/**
 * here we use custom errors with the additional field 'parameters'
 */

/**
 * transform an object of parameters to a presentable string
 */
function parametersToString(parameters) {
  var ret = '';
  if (Object.keys(parameters).length === 0) return ret;
  ret += 'Given parameters: {\n';
  ret += Object.keys(parameters).map(function (k) {
    var paramStr = '[object Object]';

    try {
      paramStr = JSON.stringify(parameters[k], function (_k, v) {
        return v === undefined ? null : v;
      }, 2);
    } catch (e) {}

    return k + ':' + paramStr;
  }).join('\n');
  ret += '}';
  return ret;
}

function messageForError(message, code, parameters) {
  return 'RxError (' + code + '):' + '\n' + message + '\n' + parametersToString(parameters);
}

var RxError = /*#__PURE__*/function (_Error) {
  (0, _inheritsLoose2["default"])(RxError, _Error);

  function RxError(code, message) {
    var _this;

    var parameters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var mes = messageForError(message, code, parameters);
    _this = _Error.call(this, mes) || this;
    _this.code = code;
    _this.message = mes;
    _this.parameters = parameters;
    _this.rxdb = true; // tag them as internal

    return _this;
  }

  var _proto = RxError.prototype;

  _proto.toString = function toString() {
    return this.message;
  };

  (0, _createClass2["default"])(RxError, [{
    key: "name",
    get: function get() {
      return 'RxError (' + this.code + ')';
    }
  }, {
    key: "typeError",
    get: function get() {
      return false;
    }
  }]);
  return RxError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports.RxError = RxError;

var RxTypeError = /*#__PURE__*/function (_TypeError) {
  (0, _inheritsLoose2["default"])(RxTypeError, _TypeError);

  function RxTypeError(code, message) {
    var _this2;

    var parameters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var mes = messageForError(message, code, parameters);
    _this2 = _TypeError.call(this, mes) || this;
    _this2.code = code;
    _this2.message = mes;
    _this2.parameters = parameters;
    _this2.rxdb = true; // tag them as internal

    return _this2;
  }

  var _proto2 = RxTypeError.prototype;

  _proto2.toString = function toString() {
    return this.message;
  };

  (0, _createClass2["default"])(RxTypeError, [{
    key: "name",
    get: function get() {
      return 'RxTypeError (' + this.code + ')';
    }
  }, {
    key: "typeError",
    get: function get() {
      return true;
    }
  }]);
  return RxTypeError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(TypeError));

exports.RxTypeError = RxTypeError;

function newRxError(code, parameters) {
  return new RxError(code, _overwritable.overwritable.tunnelErrorMessage(code), parameters);
}

function newRxTypeError(code, parameters) {
  return new RxTypeError(code, _overwritable.overwritable.tunnelErrorMessage(code), parameters);
}

function isPouchdbConflictError(err) {
  if (err.parameters && err.parameters.pouchDbError && err.parameters.pouchDbError.status === 409) {
    return true;
  } else {
    return false;
  }
}

//# sourceMappingURL=rx-error.js.map