var _ = require('underscore');
var Q = require('q');
var Connection = require('./channel/wrapper');
var messages = require('../common/messages/message');
var ErrorCodes = require('../common/errorCodes');
var Connections = require('./connections');
var NegotiationOrchestrator = require('./orchestrator/negotiation');


class Orchestrator {
    constructor(app) {
        var self = this;
        self.app = app;
        self.connections = new Connections(self.app);
        self.negotiations = new NegotiationOrchestrator(self);
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.connections.on('connection', function(connection) {
            self.trigger('connection', connection);
        });
    }

    requestPeersWithCompleteFiles(UUID) {
        var self = this;
        self.connections.forEach(function (connection) {
            connection.hasCompleteFile(UUID).then(function (hasCompleteFile) {
                if (hasCompleteFile) {
                    self.emit('connection-complete-peer', {
                        connection: connection,
                        UUID: UUID
                    });
                }
            });
        });
    }

    requestPeersWithChunks(fromPeer, UUID, chunks) {
        var self = this;
        self.connections.forEach(function (connection) {
            if(fromPeer === connection) {
                // We don't have to ask the same peer about the
                // information.
                return;
            }
            connection.hasFileWithOneChunk(UUID, chunks)
                .then(function (existingChunks) {
                    if (existingChunks) {
                        self.emit('connection-partial-peer', {
                            connection: connection,
                            UUID: UUID,
                            chunks: existingChunks
                        });
                    }
                });
        });
    }

    requestPeerWithChunks(fromPeer, UUID, chunks) {
        var self = this;
        var defer = Q.defer();
        self.requestPeersWithChunks(fromPeer, UUID, chunks);
        var peerHandler = function(data) {
            if(data.UUID === UUID) {
                if(_.intersection(chunks, data.chunks).length > 0) {
                    defer.resolve(data.connection);
                }
            }
        };

        self.on('connection-partial-peer', peerHandler);

        return defer.promise.timeout(2000).catch(function(err) {
            if(err.code === ErrorCodes.Q_TIMEOUT) {
                // We couldn't find anything suitable during the timeout.
                // Returning null.
                return null;
            } else {
                throw err;
            }
        });
    }

    requestConnectionToPeer(fromPeer, UUID, chunks) {
        var self = this;
        self.requestPeerWithChunks(fromPeer, UUID, chunks).then(function(peer) {
            if(peer === null) {
                // No peer no handling.
                throw new messages.Error(ErrorCodes.NO_PEERS_AVAILABLE);
            }

            return self.newNegotiation(fromPeer, peer);
        });
    }

    newNegotiation(fromPeer, peer) {
        var self = this;
        return self.negotiations.create(fromPeer, peer);
    }
}

export default Orchestrator;
