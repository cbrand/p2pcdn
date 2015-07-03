var Q = require('q');
var AbstractHandler = require('../abstract/callee');
var Channel = require('./channel');

class CalleeThroughRTCHandler extends AbstractHandler {

    constructor(rtcChannel, negotiationId, offer) {
        super(offer);
        var self = this;
        self.rtcChannel = rtcChannel;
        self.negotiationId = negotiationId;
    }

    _getNegotiationChannel() {
        var self = this;
        return Q(
            new Channel(
                self.rtcChannel,
                self.negotiationId
            )
        );

    }

    _releaseNegotiationChannel(channel) {
        if(channel && channel.cleanup) {
            channel.cleanup();
        }
    }

}

export default CalleeThroughRTCHandler;
