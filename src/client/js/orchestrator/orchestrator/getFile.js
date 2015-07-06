var _ = require('underscore');
var Q = require('q');
var File = require('../../db/file');
var BaseOrchestrator = require('./base');
var DownloadOrchestrator = require('./getFile/download');
var DownloadErrors = require('./getFile/download/error');


class GetFileOrchestrator extends BaseOrchestrator {

    constructor(parentOrchestrator) {
        super(parentOrchestrator);
        var self = this;
        self.file = null;
        self.fileInfo = null;
        self.peers = [];
    }

    init(UUID) {
        var self = this;
        self.UUID = UUID;
        self.defer = Q.defer();
        self.on('peer', function(peer) {
            self.handlePeer(peer).catch(function(err) {
                if(err !== DownloadErrors.NoMorePeerData) {
                    self.defer.reject(err);
                }
            }).done();
        });
        setTimeout(function() {
            self.handlePeer(self.serverRtcChannel);
        }, 10);

        var requestFileInfo = self.serverRtcChannel
            .requestFileInfo(UUID)
            .then(self.setFileInfo.bind(self))
        ;

        var loadFile = self.loadFile().then(function(file) {
            self.file.on('finish', function() {
                self.defer.resolve(self.file);
            });
            return file;
        });

        Q.all([requestFileInfo, loadFile])
            .then(self.updateLocalFile.bind(self))
            .then(self.getPeers.bind(self))
            .done();
        return self.defer.promise;
    }

    loadFile() {
        var self = this;
        return File.loadOrCreate(self.UUID).then(function(file) {
            self.file = file;
            return file;
        });
    }

    setFileInfo(fileInfo) {
        this.fileInfo = fileInfo;
        return fileInfo;
    }

    getPeers() {
        var self = this;
        /**
         * TODO: Request a list of peers instead of only one.
         */
        return this.file.missingChunks().then(function(missingChunks) {
            return self.parentOrchestrator.requestPeerConnections(
                self.UUID,
                missingChunks
            );
        }).then(function(eventChannel) {
            eventChannel.on('connection', function(peer) {
                peer.once('close', function() {
                    self.peers = _.without(
                        self.peers,
                        peer
                    );
                });
                self.peers.push(peer);
                self.emit('peer', peer);
                return peer;
            });
        });
    }

    updateLocalFile() {
        var self = this;
        var file = self.file;
        var fileInfo = self.fileInfo;
        file.name = fileInfo.name;
        file.mimeType = fileInfo.mimeType;
        file.numChunks = fileInfo.numChunks;
        return file.save();
    }

    handlePeer(peer) {
        var self = this;
        self.peers.push(peer);
        var downloadOrchestrator = self._initOrchestrator(DownloadOrchestrator);
        return downloadOrchestrator.init(
            self.file,
            peer
        );
    }
}

export default GetFileOrchestrator;
