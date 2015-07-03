var Q = require('q');
var AbstractHandler = require('../abstract/caller');
var Channel = require('./channel');

class CallerThroughRTCHandler extends AbstractHandler {

    constructor(rtcChannel, negotiationId) {
        super();
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

export default CallerThroughRTCHandler;
