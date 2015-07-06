var events = require('events');
var PouchDB = require('pouchdb');
var db = new PouchDB('files');
var truncate = function() {
    return db.destroy().then(function() {
        db = new PouchDB('files');
    });
};

// Necessary to be able to truncate the database
// on the fly.
var getDB = function() {
    return db;
};

class FileBase extends events.EventEmitter {
    static get db() {
        return getDB();
    }
}

export {
    truncate,
    FileBase as Base
};
