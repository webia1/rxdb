"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOldCollection = createOldCollection;
exports._getOldCollections = _getOldCollections;
exports.mustMigrate = mustMigrate;
exports.createDataMigrator = createDataMigrator;
exports.runStrategyIfNotNull = runStrategyIfNotNull;
exports.getBatchOfOldCollection = getBatchOfOldCollection;
exports.migrateDocumentData = migrateDocumentData;
exports.isDocumentDataWithoutRevisionEqual = isDocumentDataWithoutRevisionEqual;
exports._migrateDocument = _migrateDocument;
exports.deleteOldCollection = deleteOldCollection;
exports.migrateOldCollection = migrateOldCollection;
exports.migratePromise = migratePromise;
exports.DataMigrator = void 0;

var _rxjs = require("rxjs");

var _deepEqual = _interopRequireDefault(require("deep-equal"));

var _pouchDb = require("../../pouch-db");

var _util = require("../../util");

var _rxSchema = require("../../rx-schema");

var _rxError = require("../../rx-error");

var _overwritable = require("../../overwritable");

var _hooks = require("../../hooks");

var _crypter = require("../../crypter");

var _rxCollectionHelper = require("../../rx-collection-helper");

var _migrationState = require("./migration-state");

var _operators = require("rxjs/operators");

/**
 * The DataMigrator handles the documents from collections with older schemas
 * and transforms/saves them into the newest collection
 */

/**
 * TODO this should be completely rewritten because:
 * - The current implemetation does not use pouchdb'S bulkDocs which is much faster
 * - This could have been done in much less code which would be easier to uderstand
 *
 */
var DataMigrator = /*#__PURE__*/function () {
  function DataMigrator(newestCollection, migrationStrategies) {
    this._migrated = false;
    this.newestCollection = newestCollection;
    this.migrationStrategies = migrationStrategies;
    this.currentSchema = newestCollection.schema;
    this.database = newestCollection.database;
    this.name = newestCollection.name;
  }

  var _proto = DataMigrator.prototype;

  _proto.migrate = function migrate() {
    var _this = this;

    var batchSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

    if (this._migrated) {
      throw (0, _rxError.newRxError)('DM1');
    }

    this._migrated = true;
    var state = {
      done: false,
      // true if finished
      total: 0,
      // will be the doc-count
      handled: 0,
      // amount of handled docs
      success: 0,
      // handled docs which successed
      deleted: 0,
      // handled docs which got deleted
      percent: 0 // percentage

    };
    var stateSubject = new _rxjs.Subject();
    /**
     * Add to output of RxDatabase.migrationStates
     */

    var allSubject = (0, _migrationState.getMigrationStateByDatabase)(this.newestCollection.database);
    var allList = allSubject.getValue().slice(0);
    allList.push(stateSubject.asObservable());
    allSubject.next(allList);
    /**
     * TODO this is a side-effect which might throw
     * We did this because it is not possible to create new Observer(async(...))
     * @link https://github.com/ReactiveX/rxjs/issues/4074
     */

    (function () {
      var oldCols;
      return _getOldCollections(_this).then(function (ret) {
        oldCols = ret;
        var countAll = Promise.all(oldCols.map(function (oldCol) {
          return (0, _pouchDb.countAllUndeleted)(oldCol.pouchdb);
        }));
        return countAll;
      }).then(function (countAll) {
        var totalCount = countAll.reduce(function (cur, prev) {
          return prev = cur + prev;
        }, 0);
        state.total = totalCount;
        stateSubject.next({
          collection: _this.newestCollection,
          state: (0, _util.flatClone)(state)
        });
        var currentCol = oldCols.shift();
        var currentPromise = Promise.resolve();

        var _loop = function _loop() {
          var migrationState$ = migrateOldCollection(currentCol, batchSize);
          currentPromise = currentPromise.then(function () {
            return new Promise(function (res) {
              var sub = migrationState$.subscribe(function (subState) {
                state.handled++;
                state[subState.type] = state[subState.type] + 1;
                state.percent = Math.round(state.handled / state.total * 100);
                stateSubject.next({
                  collection: _this.newestCollection,
                  state: (0, _util.flatClone)(state)
                });
              }, function (e) {
                sub.unsubscribe();
                stateSubject.error(e);
              }, function () {
                sub.unsubscribe();
                res();
              });
            });
          });
          currentCol = oldCols.shift();
        };

        while (currentCol) {
          _loop();
        }

        return currentPromise;
      }).then(function () {
        state.done = true;
        state.percent = 100;
        stateSubject.next({
          collection: _this.newestCollection,
          state: (0, _util.flatClone)(state)
        });
        stateSubject.complete();
      });
    })();

    return stateSubject.pipe((0, _operators.map)(function (withCollection) {
      return withCollection.state;
    }));
  };

  _proto.migratePromise = function migratePromise(batchSize) {
    var _this2 = this;

    if (!this._migratePromise) {
      this._migratePromise = mustMigrate(this).then(function (must) {
        if (!must) return Promise.resolve(false);else return new Promise(function (res, rej) {
          var state$ = _this2.migrate(batchSize);

          state$.subscribe(null, rej, res);
        });
      });
    }

    return this._migratePromise;
  };

  return DataMigrator;
}();

exports.DataMigrator = DataMigrator;

function createOldCollection(version, schemaObj, dataMigrator) {
  var database = dataMigrator.newestCollection.database;
  var schema = (0, _rxSchema.createRxSchema)(schemaObj, false);
  var ret = {
    version: version,
    dataMigrator: dataMigrator,
    newestCollection: dataMigrator.newestCollection,
    database: database,
    schema: (0, _rxSchema.createRxSchema)(schemaObj, false),
    pouchdb: database._spawnPouchDB(dataMigrator.newestCollection.name, version, dataMigrator.newestCollection.pouchSettings),
    _crypter: (0, _crypter.createCrypter)(database.password, schema)
  };

  if (schema.doKeyCompression()) {
    ret._keyCompressor = _overwritable.overwritable.createKeyCompressor(schema);
  }

  return ret;
}
/**
 * get an array with OldCollection-instances from all existing old pouchdb-instance
 */


function _getOldCollections(dataMigrator) {
  return Promise.all((0, _rxSchema.getPreviousVersions)(dataMigrator.currentSchema.jsonSchema).map(function (v) {
    return dataMigrator.database.internalStore.get(dataMigrator.name + '-' + v);
  }).map(function (fun) {
    return fun["catch"](function () {
      return null;
    });
  }) // auto-catch so Promise.all continues
  ).then(function (oldColDocs) {
    return oldColDocs.filter(function (colDoc) {
      return colDoc !== null;
    }).map(function (colDoc) {
      return createOldCollection(colDoc.schema.version, colDoc.schema, dataMigrator);
    });
  });
}
/**
 * returns true if a migration is needed
 */


function mustMigrate(dataMigrator) {
  if (dataMigrator.currentSchema.version === 0) {
    return Promise.resolve(false);
  }

  return _getOldCollections(dataMigrator).then(function (oldCols) {
    if (oldCols.length === 0) return false;else return true;
  });
}

function createDataMigrator(newestCollection, migrationStrategies) {
  return new DataMigrator(newestCollection, migrationStrategies);
}

function runStrategyIfNotNull(oldCollection, version, docOrNull) {
  if (docOrNull === null) {
    return Promise.resolve(null);
  } else {
    var ret = oldCollection.dataMigrator.migrationStrategies[version](docOrNull, oldCollection);
    var retPromise = (0, _util.toPromise)(ret);
    return retPromise;
  }
}

function getBatchOfOldCollection(oldCollection, batchSize) {
  return (0, _pouchDb.getBatch)(oldCollection.pouchdb, batchSize).then(function (docs) {
    return docs.map(function (doc) {
      return (0, _rxCollectionHelper._handleFromPouch)(oldCollection, doc);
    });
  });
}
/**
 * runs the doc-data through all following migrationStrategies
 * so it will match the newest schema.
 * @throws Error if final doc does not match final schema or migrationStrategy crashes
 * @return final object or null if migrationStrategy deleted it
 */


function migrateDocumentData(oldCollection, docData) {
  /**
   * We cannot deep-clone Blob or Buffer
   * so we just flat clone it here
   * and attach it to the deep cloned document data.
   */
  var attachmentsBefore = (0, _util.flatClone)(docData._attachments);
  var mutateableDocData = (0, _util.clone)(docData);
  mutateableDocData._attachments = attachmentsBefore;
  var nextVersion = oldCollection.version + 1; // run the document throught migrationStrategies

  var currentPromise = Promise.resolve(mutateableDocData);

  var _loop2 = function _loop2() {
    var version = nextVersion;
    currentPromise = currentPromise.then(function (docOrNull) {
      return runStrategyIfNotNull(oldCollection, version, docOrNull);
    });
    nextVersion++;
  };

  while (nextVersion <= oldCollection.newestCollection.schema.version) {
    _loop2();
  }

  return currentPromise.then(function (doc) {
    if (doc === null) return Promise.resolve(null); // check final schema

    try {
      oldCollection.newestCollection.schema.validate(doc);
    } catch (err) {
      var asRxError = err;
      throw (0, _rxError.newRxError)('DM2', {
        fromVersion: oldCollection.version,
        toVersion: oldCollection.newestCollection.schema.version,
        originalDoc: docData,
        finalDoc: doc,

        /**
         * pass down data from parent error,
         * to make it better understandable what did not work
         */
        errors: asRxError.parameters.errors,
        schema: asRxError.parameters.schema
      });
    }

    return doc;
  });
}

function isDocumentDataWithoutRevisionEqual(doc1, doc2) {
  var doc1NoRev = Object.assign({}, doc1, {
    _attachments: undefined,
    _rev: undefined
  });
  var doc2NoRev = Object.assign({}, doc2, {
    _attachments: undefined,
    _rev: undefined
  });
  return (0, _deepEqual["default"])(doc1NoRev, doc2NoRev);
}
/**
 * transform docdata and save to new collection
 * @return status-action with status and migrated document
 */


function _migrateDocument(oldCollection, docData) {
  var action = {
    res: null,
    type: '',
    migrated: null,
    doc: docData,
    oldCollection: oldCollection,
    newestCollection: oldCollection.newestCollection
  };
  return (0, _hooks.runAsyncPluginHooks)('preMigrateDocument', {
    docData: docData,
    oldCollection: oldCollection
  }).then(function () {
    return migrateDocumentData(oldCollection, docData);
  }).then(function (migrated) {
    /**
     * Determiniticly handle the revision
     * so migrating the same data on multiple instances
     * will result in the same output.
     */
    if (isDocumentDataWithoutRevisionEqual(docData, migrated)) {
      /**
       * Data not changed by migration strategies, keep the same revision.
       * This ensures that other replicated instances that did not migrate already
       * will still have the same document.
       */
      migrated._rev = docData._rev;
    } else if (migrated !== null) {
      /**
       * data changed, increase revision height
       * so replicating instances use our new document data
       */
      var newHeight = (0, _util.getHeightOfRevision)(docData._rev) + 1;
      var newRevision = newHeight + '-' + (0, _util.createRevision)(migrated, true);
      migrated._rev = newRevision;
    }

    action.migrated = migrated;

    if (migrated) {
      /**
       * save to newest collection
       * notice that this data also contains the attachments data
       */
      var attachmentsBefore = migrated._attachments;

      var saveData = oldCollection.newestCollection._handleToPouch(migrated);

      saveData._attachments = attachmentsBefore;
      return oldCollection.newestCollection.pouch.bulkDocs([saveData], {
        /**
         * We need new_edits: false
         * because we provide the _rev by our own
         */
        new_edits: false
      }).then(function () {
        action.res = saveData;
        action.type = 'success';
        return (0, _hooks.runAsyncPluginHooks)('postMigrateDocument', action);
      });
    } else {
      /**
       * Migration strategy returned null
       * which means we should not migrate this document,
       * just drop it.
       */
      action.type = 'deleted';
    }
  }).then(function () {
    // remove from old collection
    return oldCollection.pouchdb.remove((0, _rxCollectionHelper._handleToPouch)(oldCollection, docData))["catch"](function () {});
  }).then(function () {
    return action;
  });
}
/**
 * deletes this.pouchdb and removes it from the database.collectionsCollection
 */


function deleteOldCollection(oldCollection) {
  return oldCollection.pouchdb.destroy().then(function () {
    return oldCollection.database.removeCollectionDoc(oldCollection.dataMigrator.name, oldCollection.schema);
  });
}
/**
 * runs the migration on all documents and deletes the pouchdb afterwards
 */


function migrateOldCollection(oldCollection) {
  var batchSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

  if (oldCollection._migrate) {
    // already running
    throw (0, _rxError.newRxError)('DM3');
  }

  oldCollection._migrate = true;
  var observer = new _rxjs.Subject();
  /**
   * TODO this is a side-effect which might throw
   * @see DataMigrator.migrate()
   */

  (function () {
    var error;

    var allBatchesDone = function allBatchesDone() {
      // remove this oldCollection
      return deleteOldCollection(oldCollection).then(function () {
        return observer.complete();
      });
    };

    var handleOneBatch = function handleOneBatch() {
      return getBatchOfOldCollection(oldCollection, batchSize).then(function (batch) {
        if (batch.length === 0) {
          allBatchesDone();
          return false;
        } else {
          return Promise.all(batch.map(function (doc) {
            return _migrateDocument(oldCollection, doc).then(function (action) {
              return observer.next(action);
            });
          }))["catch"](function (e) {
            return error = e;
          }).then(function () {
            return true;
          });
        }
      }).then(function (next) {
        if (!next) return;
        if (error) observer.error(error);else handleOneBatch();
      });
    };

    handleOneBatch();
  })();

  return observer.asObservable();
}

function migratePromise(oldCollection, batchSize) {
  if (!oldCollection._migratePromise) {
    oldCollection._migratePromise = new Promise(function (res, rej) {
      var state$ = migrateOldCollection(oldCollection, batchSize);
      state$.subscribe(null, rej, res);
    });
  }

  return oldCollection._migratePromise;
}

//# sourceMappingURL=data-migrator.js.map