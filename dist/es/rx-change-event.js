/**
 * RxChangeEvents a emitted when something in the database changes
 * they can be grabbed by the observables of database, collection and document
 */
export var RxChangeEvent = /*#__PURE__*/function () {
  function RxChangeEvent(operation, documentId, documentData, databaseToken, collectionName, isLocal,
  /**
   * timestam on when the operation was triggered
   * and when it was finished
   * This is optional because we do not have this time
   * for events that come from pouchdbs changestream.
   */
  startTime, endTime, previousData, rxDocument) {
    this.operation = operation;
    this.documentId = documentId;
    this.documentData = documentData;
    this.databaseToken = databaseToken;
    this.collectionName = collectionName;
    this.isLocal = isLocal;
    this.startTime = startTime;
    this.endTime = endTime;
    this.previousData = previousData;
    this.rxDocument = rxDocument;
  }

  var _proto = RxChangeEvent.prototype;

  _proto.isIntern = function isIntern() {
    if (this.collectionName && this.collectionName.charAt(0) === '_') {
      return true;
    } else {
      return false;
    }
  };

  _proto.toJSON = function toJSON() {
    var ret = {
      operation: this.operation,
      documentId: this.documentId,
      documentData: this.documentData,
      previousData: this.previousData ? this.previousData : undefined,
      databaseToken: this.databaseToken,
      collectionName: this.collectionName,
      isLocal: this.isLocal,
      startTime: this.startTime,
      endTime: this.endTime
    };
    return ret;
  };

  _proto.toEventReduceChangeEvent = function toEventReduceChangeEvent() {
    switch (this.operation) {
      case 'INSERT':
        return {
          operation: this.operation,
          id: this.documentId,
          doc: this.documentData,
          previous: null
        };

      case 'UPDATE':
        return {
          operation: this.operation,
          id: this.documentId,
          doc: this.documentData,
          previous: this.previousData ? this.previousData : 'UNKNOWN'
        };

      case 'DELETE':
        return {
          operation: this.operation,
          id: this.documentId,
          doc: null,
          previous: this.previousData
        };
    }
  };

  return RxChangeEvent;
}();
export function changeEventfromPouchChange(changeDoc, collection, startTime, // time when the event was streamed out of pouchdb
endTime) {
  var operation = changeDoc._rev.startsWith('1-') ? 'INSERT' : 'UPDATE';

  if (changeDoc._deleted) {
    operation = 'DELETE';
  } // decompress / primarySwap


  var doc = collection._handleFromPouch(changeDoc);

  var documentId = doc[collection.schema.primaryPath];
  var cE = new RxChangeEvent(operation, documentId, doc, collection.database.token, collection.name, false, startTime, endTime);
  return cE;
}
export function createInsertEvent(collection, docData, startTime, endTime, doc) {
  var ret = new RxChangeEvent('INSERT', docData[collection.schema.primaryPath], docData, collection.database.token, collection.name, false, startTime, endTime, null, doc);
  return ret;
}
export function createUpdateEvent(collection, docData, previous, startTime, endTime, rxDocument) {
  return new RxChangeEvent('UPDATE', docData[collection.schema.primaryPath], docData, collection.database.token, collection.name, false, startTime, endTime, previous, rxDocument);
}
export function createDeleteEvent(collection, docData, previous, startTime, endTime, rxDocument) {
  return new RxChangeEvent('DELETE', docData[collection.schema.primaryPath], docData, collection.database.token, collection.name, false, startTime, endTime, previous, rxDocument);
}
export function isInstanceOf(obj) {
  return obj instanceof RxChangeEvent;
}
//# sourceMappingURL=rx-change-event.js.map