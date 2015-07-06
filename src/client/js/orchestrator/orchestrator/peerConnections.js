var BaseConnectionHandler = require('./base');
var RTCCallerConnectionHandler = require('../../rtc/connection/handler/throughRTC/caller');
var ChannelWrapper = require('../channel/wrapper');
var PeerConnection = require('./peerConnection');


class PeerConnectionsOrchestrator extends BaseConnectionHandler {

    constructor(parentOrchestrator) {
        super(parentOrchestrator);
        var self = this;
        self.negotiationId = null;
    }

    init(UUID, missingChunks) {
        var self = this;
        var serverRtcChannel = self.serverRtcChannel;

        var peerEmitter = serverRtcChannel.getPeersFor(UUID, missingChunks);
        peerEmitter.on('peer', function(message) {
            var peerConnection = new PeerConnection(self.parentOrchestrator);
            peerConnection.setNegotiationIdFromMessage(message);
            peerConnection.initRTCNegotiation().then(function(channel) {
                return new ChannelWrapper(channel);
            }).then(function(channelHandler) {
                peerEmitter.emit('connection', channelHandler);
                self.emit('connection', channelHandler);
            }).done();
        });
        return peerEmitter;
    }

}

export default PeerConnectionsOrchestrator;
