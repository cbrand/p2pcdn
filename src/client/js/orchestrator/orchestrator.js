var events = require('events');
var PeerConnectionOrchestrator = require('./orchestrator/peerConnection');
var PeerConnectionsOrchestrator = require('./orchestrator/peerConnections');
var RequestFileOrchestrator = require('./orchestrator/getFile');
var ChannelWrapper = require('./channel/wrapper');

class Orchestrator extends events.EventEmitter {
    constructor(serverRtcChannel, app) {
        super();
        var self = this;
        self.app = app;
        self.serverRtcChannel = new ChannelWrapper(serverRtcChannel);
        self.connections = [];
    }

    _initOrchestrator(orchestratorClass) {
        var self = this;
        return new orchestratorClass(
            self
        );
    }

    requestPeerConnection(UUID, missingChunks) {
        var self = this;
        var peerConnectionOrchestrator = self._initOrchestrator(PeerConnectionOrchestrator);
        return peerConnectionOrchestrator.init(UUID, missingChunks)
            .then(function(channel) {
                self.connections.push(channel);
                return channel;
            });
    }

    requestPeerConnections(UUID, missingChunks) {
        var self = this;
        var peerConnectionsOrchestrator = self._initOrchestrator(PeerConnectionsOrchestrator);
        return peerConnectionsOrchestrator.init(UUID, missingChunks);
    }

    requestFile(UUID) {
        var self = this;
        var requestFileOrchestrator = self._initOrchestrator(RequestFileOrchestrator);
        return requestFileOrchestrator.init(UUID);
    }

}

export default Orchestrator;
