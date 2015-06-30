var Q = require('q');
var persistence = require('./persistence/file');
var ChunkHandler = require('./handler/chunk');


class File extends persistence.Base {

    constructor(id) {
        super();
        var self = this;
        self.dbFile = {};
        self.id = id;
        self._chunkHandler = new ChunkHandler(this);
    }

    get id() {
        return this.dbFile._id;
    }

    set id(value) {
        this.dbFile._id = value;
    }

    get name() {
        return this.dbFile.fileName;
    }

    set name(value) {
        this.dbFile.fileName = value;
    }

    get mimeType() {
        return this.dbFile.mimeType;
    }

    set mimeType(value) {
        this.dbFile.mimeType = value;
    }

    get numChunks() {
        return this.dbFile.numChunks || 0;
    }

    set numChunks(value) {
        this.dbFile.numChunks = value;
    }

    updateFromDB(dbFile) {
        var self = this;
        self.dbFile = dbFile;
        return Q(self);
    }

    static load(id) {
        return File.db.get(id).then(function (dbFile) {
            var file = new File(id);
            return file.updateFromDB(dbFile);
        });
    }

    refresh(revision) {
        var self = this;
        return File.db.get(self.id, {
            rev: revision
        }).then(function(dbFile) {
            return self.updateFromDB(dbFile);
        });
    }

    static loadOrCreate(id) {
        return File.load(id).catch(function (err) {
            if(err.status == 404) {
                return new File(id);
            }
            throw err;
        });
    }

    remove() {
        var self = this;
        var promise;
        if (self.dbFile == null) {
            promise = File.db.get(id).catch(function (err) {
                if(err.status == 404) {
                    return null;
                }
                throw err;
            });
        } else {
            promise = Q(self.dbFile);
        }
        return promise.then(function (dbFile) {
            if (dbFile !== null) {
                return File.db.remove(dbFile);
            }
        });
    }

    save() {
        var self = this;
        return File.db.put(self.dbFile).then(function(result) {
            return self.refresh(result.rev);
        });
    }

    hasChunk(chunkNum) {
        return this._chunkHandler.has(chunkNum);
    }

    getChunk(chunkNum) {
        return this._chunkHandler.get(chunkNum);
    }

    setChunk(chunkNum, chunk) {
        return this._chunkHandler.set(chunkNum, chunk);
    }

    removeChunk(chunkNum, chunk) {
        return this._chunkHandler.remove(chunkNum, chunk);
    }

}

export default File;
