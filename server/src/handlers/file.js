var Q = require('q');
var fs = require('fs');
var crypto = require('crypto');
var mime = require('mime');

var db = require('../db');
var StorageHandler = require('./storage');

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
    function has(uuid) {
        return db.File.count({
            where: {
                uuid: uuid
            }
        }).then(function(uuidExists) {
            if(uuidExists) {
                return this.storage.has(uuid);
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
     * @returns {Promise.<Boolean>}
     */
    function add(fileName, fileReadStream, options) {
        var self = this;
        options = options || {};
        if (!options.mimeType) {
            options.mimeType = mime.lookup(
                fileName,
                'application/octet-stream');
        }

        self.storage.add(fileReadStream).then(function(uuid) {
            return db.File.create({
                uuid: uuid,
                fileName: fileName,
                mimeType: options.mimeType
            });
        });
    }

    /**
     * Returns the file handle to the given uuid or fails, if the
     * file does not exist.
     *
     * @param uuid
     * @returns {Promise.<File>}
     */
    function get(uuid) {
        // To Be done
    }


}
