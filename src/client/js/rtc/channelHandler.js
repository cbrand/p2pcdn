var _ = require('underscore');
var messages = require('../messages/message');
var AbstractChannelHandler = require('../common/rtc/channelHandler');
var Negotiation = messages.ClientNegotiation;
var NegotiationType = Negotiation.NegotiationType;

var handlers = [
    require('./channelHandlers/fileHandler')
];

var isNegotiation = function (message) {
    return message instanceof Negotiation;
};


class ChannelHandler extends AbstractChannelHandler {

    constructor(channel, options) {
        options = options || {};
        super(channel);
        var self = this;
        self.rights = _.extend({
            rtc: false
        }, options.rights);
        self.app = options.app || null;
        self.on('message', self.onMessage.bind(self));
    }

    onMessage(message) {
        var self = this;
        var handlerFound = false;
        handlers.forEach(function (Handler) {
            var handler = new Handler(message, self);
            if (handler.supports()) {
                handlerFound = true;
                self.emit('handler', handler);
            }
        });

        // Special handling for negotiation messages.
        if (isNegotiation(message)) {
            self.emitNegotiation(message);
            return;
        }

        if (!handlerFound) {
            self.error(messages.Error.Code.UNKNOWN_COMMAND);
        }
    }

    /**
     * Emits negotiation data as events on the channel.
     */
    emitNegotiation(message) {
        var self = this;
        if (!self.rights.rtc) {
            // Not having the rtc right flag disallows
            // processing of any rtc conection requests.
            return;
        }

        switch (message.negotiationType) {
            case NegotiationType.ICE_CANDIDATE:
                self.emit('rtc_icecandidate', {
                    negotiationId: message.id,
                    candidate: message.payload
                });
                break;
            case NegotiationType.OFFER:
                self.emit('new_rtc_offer', {
                    negotiationId: message.id,
                    offer: message.payload
                });
                break;
            case NegotiationType.OFFER_RESPONSE:
                self.emit('rtc_offer', {
                    negotiationId: message.id,
                    offer: message.payload
                });
                break;
            /* istanbul ignore next */
            default:
                console.warning(
                    'Unknown RTC negotiation message from server with type: ' +
                    message.negotiationType
                );
        }
    }

}

export default ChannelHandler;
