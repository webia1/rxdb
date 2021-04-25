"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pluginMissing = pluginMissing;
exports.fastUnsecureHash = fastUnsecureHash;
exports.hash = hash;
exports.generateId = generateId;
exports.now = now;
exports.nextTick = nextTick;
exports.promiseWait = promiseWait;
exports.toPromise = toPromise;
exports.requestIdlePromise = requestIdlePromise;
exports.promiseSeries = promiseSeries;
exports.requestIdleCallbackIfAvailable = requestIdleCallbackIfAvailable;
exports.ucfirst = ucfirst;
exports.trimDots = trimDots;
exports.sortObject = sortObject;
exports.stringifyFilter = stringifyFilter;
exports.randomCouchString = randomCouchString;
exports.shuffleArray = shuffleArray;
exports.removeOneFromArrayIfMatches = removeOneFromArrayIfMatches;
exports.adapterObject = adapterObject;
exports.flatClone = flatClone;
exports.flattenObject = flattenObject;
exports.getHeightOfRevision = getHeightOfRevision;
exports.createRevision = createRevision;
exports.overwriteGetterForCaching = overwriteGetterForCaching;
exports.isFolderPath = isFolderPath;
exports.blobBufferUtil = exports.LOCAL_PREFIX = exports.isElectronRenderer = exports.clone = exports.RXDB_HASH_SALT = void 0;

var _randomToken = _interopRequireDefault(require("random-token"));

var _clone = _interopRequireDefault(require("clone"));

var _sparkMd = _interopRequireDefault(require("spark-md5"));

var _isElectron = _interopRequireDefault(require("is-electron"));

var _pouchdbMd = require("pouchdb-md5");

var _pouchdbUtils = require("pouchdb-utils");

/**
 * this contains a mapping to basic dependencies
 * which should be easy to change
 */

/**
 * Returns an error that indicates that a plugin is missing
 * We do not throw a RxError because this should not be handled
 * programmatically but by using the correct import
 */
function pluginMissing(pluginKey) {
  var keyParts = pluginKey.split('-');
  var pluginName = 'RxDB';
  keyParts.forEach(function (part) {
    pluginName += ucfirst(part);
  });
  pluginName += 'Plugin';
  return new Error("You are using a function which must be overwritten by a plugin.\n        You should either prevent the usage of this function or add the plugin via:\n            import { " + pluginName + " } from 'rxdb/plugins/" + pluginKey + "';\n            addRxPlugin(" + pluginName + ");\n        ");
}
/**
 * this is a very fast hashing but its unsecure
 * @link http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 * @return a number as hash-result
 */


function fastUnsecureHash(obj) {
  if (typeof obj !== 'string') obj = JSON.stringify(obj);
  var hashValue = 0,
      i,
      chr,
      len;
  if (obj.length === 0) return hashValue;

  for (i = 0, len = obj.length; i < len; i++) {
    chr = obj.charCodeAt(i); // tslint:disable-next-line

    hashValue = (hashValue << 5) - hashValue + chr; // tslint:disable-next-line

    hashValue |= 0; // Convert to 32bit integer
  }

  if (hashValue < 0) hashValue = hashValue * -1;
  return hashValue;
}
/**
 * Does a RxDB-specific hashing of the given data.
 * We use a static salt so using a rainbow-table
 * or google-ing the hash will not work.
 *
 * spark-md5 is used here
 * because pouchdb uses the same
 * and build-size could be reduced by 9kb
 */


var RXDB_HASH_SALT = 'rxdb-specific-hash-salt';
exports.RXDB_HASH_SALT = RXDB_HASH_SALT;

function hash(msg) {
  if (typeof msg !== 'string') {
    msg = JSON.stringify(msg);
  }

  return _sparkMd["default"].hash(RXDB_HASH_SALT + msg);
}
/**
 * generate a new _id as db-primary-key
 */


function generateId() {
  return (0, _randomToken["default"])(10) + ':' + now();
}
/**
 * Returns the current unix time in milliseconds
 * Because the accuracy of getTime() in javascript is bad,
 * and we cannot rely on performance.now() on all plattforms,
 * this method implements a way to never return the same value twice.
 * This ensures that when now() is called often, we do not loose the information
 * about which call came first and which came after.
 * Caution: Do not call this too often in a short timespan
 * because it might return 'the future'
 */


var _lastNow = 0;

function now() {
  var ret = new Date().getTime();

  if (ret <= _lastNow) {
    ret = _lastNow + 1;
  }

  _lastNow = ret;
  return ret;
}
/**
 * returns a promise that resolves on the next tick
 */


function nextTick() {
  return new Promise(function (res) {
    return setTimeout(res, 0);
  });
}

function promiseWait() {
  var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
}

function toPromise(maybePromise) {
  if (maybePromise && typeof maybePromise.then === 'function') {
    // is promise
    return maybePromise;
  } else {
    return Promise.resolve(maybePromise);
  }
}

function requestIdlePromise() {
  var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (typeof window === 'object' && window['requestIdleCallback']) {
    return new Promise(function (res) {
      return window['requestIdleCallback'](res, {
        timeout: timeout
      });
    });
  } else return Promise.resolve();
}
/**
 * like Promise.all() but runs in series instead of parallel
 * @link https://github.com/egoist/promise.series/blob/master/index.js
 * @param tasks array with functions that return a promise
 */


function promiseSeries(tasks, initial) {
  return tasks.reduce(function (current, next) {
    return current.then(next);
  }, Promise.resolve(initial));
}
/**
 * run the callback if requestIdleCallback available
 * do nothing if not
 * @link https://developer.mozilla.org/de/docs/Web/API/Window/requestIdleCallback
 */


function requestIdleCallbackIfAvailable(fun) {
  if (typeof window === 'object' && window['requestIdleCallback']) window['requestIdleCallback'](fun);
}
/**
 * uppercase first char
 */


function ucfirst(str) {
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}
/**
 * removes trailing and ending dots from the string
 */


function trimDots(str) {
  // start
  while (str.charAt(0) === '.') {
    str = str.substr(1);
  } // end


  while (str.slice(-1) === '.') {
    str = str.slice(0, -1);
  }

  return str;
}
/**
 * deep-sort an object so its attributes are in lexical order.
 * Also sorts the arrays inside of the object if no-array-sort not set
 */


function sortObject(obj) {
  var noArraySort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!obj) return obj; // do not sort null, false or undefined
  // array

  if (!noArraySort && Array.isArray(obj)) {
    return obj.sort(function (a, b) {
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      if (typeof a === 'object') return 1;else return -1;
    }).map(function (i) {
      return sortObject(i, noArraySort);
    });
  } // object
  // array is also of type object


  if (typeof obj === 'object' && !Array.isArray(obj)) {
    if (obj instanceof RegExp) return obj;
    var out = {};
    Object.keys(obj).sort(function (a, b) {
      return a.localeCompare(b);
    }).forEach(function (key) {
      out[key] = sortObject(obj[key], noArraySort);
    });
    return out;
  } // everything else


  return obj;
}
/**
 * used to JSON.stringify() objects that contain a regex
 * @link https://stackoverflow.com/a/33416684 thank you Fabian Jakobs!
 */


function stringifyFilter(key, value) {
  if (value instanceof RegExp) return value.toString();
  return value;
}
/**
 * get a random string which can be used with couchdb
 * @link http://stackoverflow.com/a/1349426/3443137
 */


function randomCouchString() {
  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
/**
 * shuffle the given array
 */


function shuffleArray(arr) {
  return arr.sort(function () {
    return Math.random() - 0.5;
  });
}
/**
 * @link https://stackoverflow.com/a/15996017
 */


function removeOneFromArrayIfMatches(ar, condition) {
  ar = ar.slice();
  var i = ar.length;
  var done = false;

  while (i-- && !done) {
    if (condition(ar[i])) {
      done = true;
      ar.splice(i, 1);
    }
  }

  return ar;
}
/**
 * transforms the given adapter into a pouch-compatible object
 */


function adapterObject(adapter) {
  var adapterObj = {
    db: adapter
  };

  if (typeof adapter === 'string') {
    adapterObj = {
      adapter: adapter
    };
  }

  return adapterObj;
}

function recursiveDeepCopy(o) {
  if (!o) return o;
  return (0, _clone["default"])(o, false);
}

var clone = recursiveDeepCopy;
/**
 * does a flat copy on the objects,
 * is about 3 times faster then using deepClone
 * @link https://jsperf.com/object-rest-spread-vs-clone/2
 */

exports.clone = clone;

function flatClone(obj) {
  return Object.assign({}, obj);
}

var isElectronRenderer = (0, _isElectron["default"])();
/**
 * returns a flattened object
 * @link https://gist.github.com/penguinboy/762197
 */

exports.isElectronRenderer = isElectronRenderer;

function flattenObject(ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] === 'object') {
      var flatObject = flattenObject(ob[i]);

      for (var _x in flatObject) {
        if (!flatObject.hasOwnProperty(_x)) continue;
        toReturn[i + '.' + _x] = flatObject[_x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }

  return toReturn;
}

function getHeightOfRevision(revString) {
  var first = revString.split('-')[0];
  return parseInt(first, 10);
}

/**
 * Creates a revision string that does NOT include the revision height
 * Copied and adapted from pouchdb-utils/src/rev.js
 * TODO not longer needed when this PR is merged: https://github.com/pouchdb/pouchdb/pull/8274
 */
function createRevision(docData, deterministic_revs) {
  if (!deterministic_revs) {
    return (0, _pouchdbUtils.rev)(docData, false);
  }

  var docWithoutRev = Object.assign({}, docData, {
    _rev: undefined,
    _rev_tree: undefined
  });
  return (0, _pouchdbMd.stringMd5)(JSON.stringify(docWithoutRev));
}
/**
 * prefix of local pouchdb documents
 */


var LOCAL_PREFIX = '_local/';
/**
 * overwrites the getter with the actual value
 * Mostly used for caching stuff on the first run
 */

exports.LOCAL_PREFIX = LOCAL_PREFIX;

function overwriteGetterForCaching(obj, getterName, value) {
  Object.defineProperty(obj, getterName, {
    get: function get() {
      return value;
    }
  });
  return value;
}
/**
 * returns true if the given name is likely a folder path
 */


function isFolderPath(name) {
  // do not check, if foldername is given
  if (name.includes('/') || // unix
  name.includes('\\') // windows
  ) {
      return true;
    } else {
    return false;
  }
}

var blobBufferUtil = {
  /**
   * depending if we are on node or browser,
   * we have to use Buffer(node) or Blob(browser)
   */
  createBlobBuffer: function createBlobBuffer(data, type) {
    var blobBuffer;

    if (isElectronRenderer) {
      // if we are inside of electron-renderer, always use the node-buffer
      return Buffer.from(data, {
        type: type
      });
    }

    try {
      // for browsers
      blobBuffer = new Blob([data], {
        type: type
      });
    } catch (e) {
      // for node
      blobBuffer = Buffer.from(data, {
        type: type
      });
    }

    return blobBuffer;
  },
  toString: function toString(blobBuffer) {
    if (blobBuffer instanceof Buffer) {
      // node
      return nextTick().then(function () {
        return blobBuffer.toString();
      });
    }

    return new Promise(function (res) {
      // browsers
      var reader = new FileReader();
      reader.addEventListener('loadend', function (e) {
        var text = e.target.result;
        res(text);
      });
      var blobBufferType = Object.prototype.toString.call(blobBuffer);
      /**
       * in the electron-renderer we have a typed array insteaf of a blob
       * so we have to transform it.
       * @link https://github.com/pubkey/rxdb/issues/1371
       */

      if (blobBufferType === '[object Uint8Array]') {
        blobBuffer = new Blob([blobBuffer]);
      }

      reader.readAsText(blobBuffer);
    });
  }
};
exports.blobBufferUtil = blobBufferUtil;

//# sourceMappingURL=util.js.map