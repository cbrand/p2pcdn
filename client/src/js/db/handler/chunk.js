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

        return ChunkHandler.db.putAttachment(
            self._dbFile._id, attachmentName, self._dbFile._rev, chunk, 'application/octet-stream'
        ).then(function (result) {
                // Necessity to reload the file with the given rev.
                debugger;
                return self._file.refresh(result.rev);
            });
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
