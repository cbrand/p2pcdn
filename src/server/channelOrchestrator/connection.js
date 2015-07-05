var _ = require('underscore');
var events = require('events');
var ChannelWrapper = require('./channel/wrapper');

var _hasChunk = function(fileInfo, chunk) {
    var hasChunk = !_.contains(fileInfo.missingChunks, chunk);
    var chunkOutOfBounds = fileInfo.numChunks >= chunk;

    return !chunkOutOfBounds && hasChunk;
};


class Connection extends events.EventEmitter {

    constructor(dataChannel) {
        super();
        var self = this;
        self.channel = new ChannelWrapper(dataChannel);
    }

    /**
     * hasCompleteFile returns if the passed fileUUID is
     * completetly existing on the remote peer.
     *
     * @param fileUUID {string}
     * @returns {Promise.<boolean>}
     */
    hasCompleteFile(fileUUID) {
        var self = this;
        return self.channel.requestFileInfo(fileUUID)
            .then(function(fileInfo) {
                return fileInfo.missingChunks.length === 0;
            });
    }

    hasFileWithOneChunk(fileUUID, chunks) {
        var self = this;
        return self.channel.requestFileInfo(fileUUID)
            .then(function(fileInfo) {
                var existingChunks = chunks.filter(function(chunk) {
                    return _hasChunk(fileInfo, chunk);
                });

                if(existingChunks.length === 0) {
                    existingChunks = null;
                }
                return existingChunks;
            });
    }
}

export default Connection;
