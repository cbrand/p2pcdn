var Q = require('q');
var fs = require('fs');
var crypto = require('crypto');
var mime = require('mime');

var db = require('../db');
var StorageHandler = require('./storage');
var File = require('../wrappers/file');

class FileHandler {
    constructor(config) {
        this.config = config;
        this.storage = new StorageHandler(config);
    }

    /**
     * Returns if the given UUID exists.
     *
     * @param uuid
     * @returns {Promise.<Boolean>}
     */
    has(uuid) {
        var self = this;
        return db.File.count({
            where: {
                uuid: uuid
            }
        }).then(function(uuidExists) {
            if (uuidExists) {
                return self.storage.has(uuid);
            }
            return false;
        });
    }

    /**
     *
     * @param {String} fileName The name wich should be added
     * @param {fs.ReadStream} fileReadStream the read stream
     * @param {object} options Additional options to add. At the moment the
     *  mime type can be set with mimeType.
     * @returns {Promise.<File>}
     */
    add(fileName, fileReadStream, options) {
        var self = this;
        options = options || {};
        if (!options.mimeType) {
            options.mimeType = mime.lookup(
                fileName,
                'application/octet-stream');
        }

        return self.storage.add(fileReadStream).then(function(uuid) {
            return db.File.create({
                uuid: uuid,
                fileName: fileName,
                mimeType: options.mimeType
            });
        }).then(self._getFromDbFile.bind(self));
    }

    /**
     * Returns the file handle to the given uuid or fails, if the
     * file does not exist.
     *
     * @param uuid
     * @returns {Promise.<File>}
     */
    get(uuid) {
        return db.File.findOne({
            where: {
                uuid: uuid
            }
        }).then(this._getFromDbFile.bind(this));
    }

    _getFromDbFile(dbFile) {
        if(dbFile == null) {
            var error = new Error('file does not exist.');
            error.isNotExist = true;
            return Q.reject(error);
        }

        return this.storage.get(dbFile.uuid).then(function(fsFile) {
            return new File(dbFile, fsFile);
        });
    }

}

export default FileHandler;
