var Q = require('q');
var events = require('events');
var NegotiationMessage = require('../../../../messages/negotiation');

var errorCodes = {
    'NON_BINARY': 1,
    'ENCODING_FAILED': 2
};

/**
 * Channel to initiate a rtc connection with the remote server
 * through a websocket broker connection.
 */
class WebsocketRTCNegotiationChannel extends events.EventEmitter {

    constructor(ws) {
        super();
        var self = this;
        self.ws = ws;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.ws.on('message', self.handleMessage.bind(self));
        self.on('message', self.handleNegotiation.bind(self));
    }

    handleMessage(data, flags) {
        var self = this;
        if (flags && !flags.binary) {
            // Wrong message type. Only accepting binary data -> close
            self.ws.close(errorCodes.NON_BINARY);
            return;
        }

        NegotiationMessage.deserialize(data).then(function (message) {
            self.emit('message', message);
        }, function (err) {
            self.ws.close(errorCodes.ENCODING_FAILED, err.toString());
        }).done();
    }

    handleNegotiation(negotiation) {
        var self = this;
        switch (negotiation.type) {
            case NegotiationMessage.Type.OFFER_RESPONSE:
            {
                self.emit('offer', negotiation.payload);
                break;
            }
            case NegotiationMessage.Type.ICE_CANDIDATE:
            {
                self.emit('icecandidate', negotiation.payload);
                break;
            }
            default:
            {
                console.warning(
                    'Unkown message type for negotiating peer connection: ' + negotiation.type
                );
            }
        }
    }

    send(message) {
        var self = this;
        return message.serialize().then(function (arrayBuffer) {
            var defer = Q.defer();
            self.ws.send(arrayBuffer, function(err) {
                if(err) {
                    defer.reject(err);
                } else {
                    defer.resolve();
                }
            });
            return defer.promise;
        });
    }

    sendIceCandidate(candidate) {
        var self = this;
        var negotiation = new NegotiationMessage();
        negotiation.type = NegotiationMessage.Type.ICE_CANDIDATE;
        negotiation.payload = candidate;
        return self.send(negotiation);
    }

    sendOffer(offer) {
        var self = this;
        var negotiation = new NegotiationMessage();
        negotiation.type = NegotiationMessage.Type.OFFER;
        negotiation.payload = offer;
        return self.send(negotiation);
    }

    close(code, reason) {
        var self = this;
        self.ws.close(code, reason);
    }

}
WebsocketRTCNegotiationChannel.ErrorCodes = errorCodes;

export default WebsocketRTCNegotiationChannel;
