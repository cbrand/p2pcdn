var Q = require('q');
var persistence = require('../persistence/file');

var chunkNumToAttachmentName = function (chunkNum) {
    return 'chunk-' + chunkNum + '.blob';
};

class ChunkHandler extends persistence.Base {

    constructor(file) {
        super();
        var self = this;
        self._file = file;
        self._lock = false;
    }

    get _dbFile() {
        return this._file.dbFile;
    }

    get _attachments() {
        var self = this;
        if (!self._dbFile._attachments) {
            self._dbFile._attachments = {};
        }
        return self._dbFile._attachments;
    }

    has(chunkNum) {
        var self = this;
        var result = !!self._attachments[chunkNumToAttachmentName(chunkNum)];
        return Q(result);
    }

    set(chunkNum, chunk) {
        var self = this;
        var attachmentName = chunkNumToAttachmentName(chunkNum);
        var defer = Q.defer();

        var putAttachment = function() {
            self._lock = true;
            self.emit('lock');
            return Q(ChunkHandler.db.putAttachment(
                self._dbFile._id, attachmentName, self._dbFile._rev, chunk, 'application/octet-stream'
            )).then(function (result) {
                    // Necessity to reload the file with the given rev.
                    return self._file.refresh(result.rev);
                }).finally(function() {
                    self._lock = false;
                    self.emit('unlock');
                }).then(function(result) {
                    defer.resolve(result);
                }).catch(function(err) {
                    defer.reject(err);
                }).done();
        };
        var lockCheck = function() {
            if(self._lock) {
                self.once('unlock', function() {
                    if(self._lock) {
                        return lockCheck();
                    } else {
                        putAttachment();
                    }
                });
            } else {
                putAttachment();
            }
        };
        lockCheck();
        return defer.promise;
    }

    get(chunkNum) {
        var self = this;
        var attachmentName = chunkNumToAttachmentName(chunkNum);
        return ChunkHandler.db.getAttachment(self._dbFile._id, attachmentName);
    }

    remove(chunkNum) {
        var self = this;
        var attachmentName = chunkNumToAttachmentName(chunkNum);
        return ChunkHandler.db.removeAttachment(self._dbFile._id, attachmentName, self._dbFile._rev).then(function (result) {
            return self._file.refresh(result.rev);
        });
    }

}

export default ChunkHandler;
