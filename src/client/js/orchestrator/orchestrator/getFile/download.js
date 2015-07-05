var _ = require('underscore');
var BaseOrchestrator = require('../base');
var errors = require('./download/error');
var NoMoreData = errors.NoMoreData;
var NoMorePeerData = errors.NoMorePeerData;


class DownloadOrchestrator extends BaseOrchestrator {

    init(file, peerConnection) {
        var self = this;
        self.file = file;
        self.peerConnection = peerConnection;
        self.remoteFileInfo = null;

        return self.startDownloadHandling();
    }

    missingChunks() {
        return this.file.missingChunks();
    }

    chunkFromPeer() {
        var self = this;
        var toProcessChunk;
        var remoteFileInfo = self.remoteFileInfo;

        return self.file.missingChunks().then(
            function (missingChunks) {
                var requestChunks = _.intersection(
                    remoteFileInfo.existingChunks,
                    missingChunks
                );
                if (requestChunks.length === 0) {
                    if(missingChunks.length === 0) {
                        self.file.trigger('finish');
                        throw NoMoreData;
                    } else {
                        throw NoMorePeerData;
                    }
                }

                var randomChunkIndex = _.random(0, requestChunks.length - 1);
                /**
                 * TODO: Implement notification to handle peer handling.
                 */
                toProcessChunk = requestChunks[randomChunkIndex];
                console.log(toProcessChunk);

                return self.peerConnection.getChunk(self.file.id, toProcessChunk).then(function(chunk) {
                    return new Blob([chunk]);
                });
            }).then(function (chunk) {
                return self.file.setChunk(toProcessChunk, chunk);
            });
    }

    requestRemoteFileInfo() {
        var self = this;
        return self.peerConnection.requestFileInfo(self.file.id).then(function (fileInfo) {
            self.remoteFileInfo = fileInfo;
            return fileInfo;
        });
    }

    startDownloadHandling() {
        var self = this;
        return self.requestRemoteFileInfo()
            .then(self.download.bind(self));
    }

    _downloadLoop() {
        var self = this;
        return self.chunkFromPeer()
            .then(function() {
                return self._downloadLoop();
            });
    }

    download() {
        var self = this;
        return self._downloadLoop()
            .catch(function(err) {
                if(err === NoMoreData) {
                    return null;
                }
                if(err === NoMorePeerData) {
                    throw NoMorePeerData;
                }
                throw err;
            });
    }

}

export default DownloadOrchestrator;
