var FileHandler = require('./fileHandler');
var messages = require('../../messages/message');
var InitClientNegotiationMessage = messages.InitiateClientNegotiation;
var RTCCallerHandler = require('../../rtc/connection/handler/throughRTC/caller');

/**
 * Command signaling to start a webrtc negotiation session.
 */
class InitClientNegotiation extends FileHandler {

    /**
     * returns if the channel handler does support
     * the given request.
     * @returns {boolean}
     */
    supports() {
        var self = this;
        return (self.message instanceof InitClientNegotiationMessage) &&
                // The channel has to have rights to negotiate rtc messages
                self.channel.rights.rtc;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Response>}
     */
    handle() {
        var self = this;
        var handler = new RTCCallerHandler(
            self.message.id,
            self.channel,
            self.app
        );
        return handler.connect().thenResolve(null);
    }

}

export default InitClientNegotiation;
