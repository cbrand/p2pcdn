
var fs = require('fs');
var constants = require('../constants');
var q = require('q');

class File {
    constructor(path) {
        this.path = path;
    }

    get _stat() {
        var stat = fs.statSync(this.path);
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
        return fs.createReadStream(
            this.path,
            {
                start: constants.CHUNK_SIZE * num,
                end: Math.min(
                    constants.CHUNK_SIZE * (num+1),
                    stat.size
                ) - 1
            }
        );
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
            data = ""
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
}

exports.File = File;
