
var constants = require('../constants');
var q = require('q');
var crypto = require('crypto');

class File {
    constructor(path) {
        this.path = path;
        this.fs = require('fs');
    }

    get _stat() {
        var stat = this.fs.statSync(this.path);
        if(!stat.isFile()) {
            throw new Error('Path is not a file.');
        }
        return stat;
    }

    /**
     * Specifies the number of chunks in the file.
     * @returns {number}
     */
    get numChunks() {
        return Math.ceil(this._stat.size / constants.CHUNK_SIZE);
    }

    /**
     * chunkStream returns the stream with the passed num data.
     * @param {number} num
     * @returns {fs.ReadStream} The opened read stream.
     */
    chunkStream(num) {
        var numChunks = this.numChunks;
        if(numChunks <= num) {
            throw new Error('Requested chunk number to high. Only have ' + numChunks + ' chunks.');
        } else if(num < 0) {
            throw new Error('number must be positive.');
        }
        var stat = this._stat;
        return this.stream({
            start: constants.CHUNK_SIZE * num,
            end: Math.min(
                constants.CHUNK_SIZE * (num + 1),
                stat.size
            ) - 1
        });
    }

    /**
     * Reads a chunk from the given file and returns the bytes represented
     * by the given chunk.
     * @param {number} num
     * @returns {Promise} will resolved as soon as the data is available.
     */
    chunk(num) {
        var deferred = q.defer(),
            readStream = this.chunkStream(num),
            data = ''
        ;

        readStream.on('data', function(chunk) {
            data += chunk;
        });
        readStream.on('error', function(err) {
            deferred.reject(err);
        });
        readStream.on('end', function() {
            deferred.resolve(data);
        });

        return deferred.promise;
    }

    /**
     * Returns the id (verification code) for the given chunk.
     * @param {number} num
     * @returns {Promise.<String>} will resolved as soon as the data is available.
     */
    chunkID(num) {
        return this.chunk(num).then(function(chunkValue) {
            var sha256 = crypto.createHash('sha256');
            sha256.update(chunkValue);
            return sha256.digest('hex');
        });
    }

    /**
     * Returns the complete data stream. Delegates the passed options if given
     * to the fs.createReadStream function.
     *
     * @returns {fs.ReadStream} The opened read stream.
     */
    stream(options) {
        options = options || {};
        return this.fs.createReadStream(
            this.path,
            options
        );
    }
}

export default File;
