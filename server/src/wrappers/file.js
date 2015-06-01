var DBFile = require('../db').File;
var FSFile = require('../data/file');

class File {

    /**
     * @param {DBFile} dbFile The database file being used for the datbasae file
     * @param {FSFile} fsFile The directory where the files are located.
     */
    constructor(dbFile, fsFile) {
        this.dbFile = dbFile;
        this.fsFile = fsFile;
        this._init();
    }

    _init() {
        var fsFile = this.fsFile;
        this.chunk = fsFile.chunk.bind(fsFile);
        this.chunkStream = fsFile.chunkStream.bind(fsFile);
        this.chunkID = fsFile.chunkID.bind(fsFile);
        this.stream = fsFile.stream.bind(fsFile);
    }

    /**
     * @returns {String}
     */
    get uuid() {
        return this.dbFile.uuid;
    }

    /**
     * @returns {String}
     */
    get fileName() {
        return this.dbFile.fileName;
    }

    /**
     * @returns {String}
     */
    get mimeType() {
        return this.dbFile.mimeType;
    }

    /**
     * @returns {Number}
     */
    get numChunks() {
        return this.fsFile.numChunks;
    }

}

export default File;
