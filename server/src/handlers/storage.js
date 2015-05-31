/**
 * Used to directly interact with items on the filesystem.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Q = require('q');

class StorageHandler {
    constructor(config) {
        this.config = config;
    }

    get _directory() {
        return this.config.fileDirectory;
    }

    get _temporaryName() {
        var self = this;
        var i = 0;
        var tempFile = function() {
            i++;
            return path.join(self._directory, 'file' + i + '.tmp');
        };

        while (true) {
            var tempPath = tempFile();
            if (!fs.existsSync(tempPath)) {
                return tempPath;
            }
        }
    }

    _pathForUUID(uuid) {
        return path.join(this._directory, uuid.toString());
    }

    /**
     * Checks if the given uuid exists in the system.
     *
     * @param uuid
     */
    has(uuid) {
        var deferred = Q.defer();
        var uuidPath = this._pathForUUID(uuid);
        fs.exists(uuidPath, deferred.resolve);

        return deferred.promise.then(function(exists) {
            return Q.Promise(function(resolve) {
                if(!exists) {
                    resolve(exists);
                } else {
                    fs.stat(uuidPath, function(stat) {
                        resolve(stat.isFile());
                    });
                }
            });
        });
    }

    /**
     * @param {fs.ReadStream} fileReadStream the read stream
     *  mime type can be set with mimeType.
     * @return The uuid of the data passed.
     * @returns {Promise.<String>}
     */
    add(fileReadStream) {
        var self = this;
        var sha256 = crypto.createHash('sha256');
        var deferred = Q.defer();
        var tempName = self._temporaryName;
        var writeStream = fs.createWriteStream(tempName);

        fileReadStream.on('data', function(data) {
            sha256.update(data);
            writeStream.write(data);
        });
        fileReadStream.on('end', function() {
            deferred.resolve();
        });

        return deferred.promise.then(function() {
            var hexSha256 = sha256.digest('hex');
            return new Q.Promise(function(resolve) {
                writeStream.end(function() {
                    resolve(hexSha256);
                });
            });
        }).then(function(uuid) {
            return new Q.Promise(function(resolve) {
                fs.rename(tempName, self._pathForUUID(uuid), function() {
                    resolve(uuid);
                });
            });
        });

    }
}

export default StorageHandler;
