"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pouch = require("./pouch");

Object.keys(_pouch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _pouch[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _pouch[key];
    }
  });
});

var _rxAttachment = require("./rx-attachment");

Object.keys(_rxAttachment).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxAttachment[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxAttachment[key];
    }
  });
});

var _rxCollection = require("./rx-collection");

Object.keys(_rxCollection).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxCollection[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxCollection[key];
    }
  });
});

var _rxDatabase = require("./rx-database");

Object.keys(_rxDatabase).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxDatabase[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxDatabase[key];
    }
  });
});

var _rxDocument = require("./rx-document");

Object.keys(_rxDocument).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxDocument[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxDocument[key];
    }
  });
});

var _rxError = require("./rx-error");

Object.keys(_rxError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxError[key];
    }
  });
});

var _rxPlugin = require("./rx-plugin");

Object.keys(_rxPlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxPlugin[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxPlugin[key];
    }
  });
});

var _rxQuery = require("./rx-query");

Object.keys(_rxQuery).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxQuery[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxQuery[key];
    }
  });
});

var _rxSchema = require("./rx-schema");

Object.keys(_rxSchema).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxSchema[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _rxSchema[key];
    }
  });
});

var _replication = require("./plugins/replication");

Object.keys(_replication).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _replication[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _replication[key];
    }
  });
});

var _replicationGraphql = require("./plugins/replication-graphql");

Object.keys(_replicationGraphql).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _replicationGraphql[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _replicationGraphql[key];
    }
  });
});

var _server = require("./plugins/server");

Object.keys(_server).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _server[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _server[key];
    }
  });
});

var _migration = require("./plugins/migration");

Object.keys(_migration).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _migration[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _migration[key];
    }
  });
});

//# sourceMappingURL=index.d.js.map