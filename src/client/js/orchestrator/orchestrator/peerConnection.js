var BaseConnectionHandler = require('./base');
var RTCCallerConnectionHandler = require('../../rtc/connection/handler/throughRTC/caller');
var ChannelWrapper = require('../channel/wrapper');


class PeerConnectionOrchestrator extends BaseConnectionHandler {

    constructor(parentOrchestrator) {
        super(parentOrchestrator);
        var self = this;
        self.negotiationId = null;
    }

    init(UUID, missingChunks) {
        var self = this;
        var serverRtcChannel = self.serverRtcChannel;

        return serverRtcChannel.getPeerFor(UUID, missingChunks)
            .then(self.setNegotiationIdFromMessage.bind(self))
            .then(self.initRTCNegotiation.bind(self))
            .then(function(channel) {
                return new ChannelWrapper(channel);
            });
    }

    setNegotiationIdFromMessage(message) {
        var self = this;
        return self.setNegotiationId(message.id);
    }

    setNegotiationId(negotiationId) {
        var self = this;
        self.negotiationId = negotiationId;
    }

    initRTCNegotiation() {
        var self = this;
        var handler = new RTCCallerConnectionHandler(
            self.baseChannel,
            self.negotiationId,
            self.app
        );
        return handler.connect();
    }

}

export default PeerConnectionOrchestrator;
