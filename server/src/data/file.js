
var fs = require('fs');
var constants = require('../constants');

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
     * Reads a chunk from the given file and returns the bytes represented
     * by the given chunk.
     * @param {number} num
     */
    chunk(num) {
        var numChunks = this.numChunks;
        if(numChunks <= num) {
            throw new Error('Requested chunk number to high. Only have ' + numChunks + ' chunks.');
        } else if(num < 0) {
            throw new Error('number must be positive.');
        }
        var stat = this._stat;

        return fs.createReadStream(this.path, {
            start: constants.CHUNK_SIZE * numChunks,
            end: Math.min(
                constants.CHUNK_SIZE * (numChunks+1),
                stat.size
            )
        });
    }
}

exports.File = File;
