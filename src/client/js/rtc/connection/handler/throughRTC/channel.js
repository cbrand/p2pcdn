var events = require('events');
var messages = require('../../../../messages/message');
var Negotiation = messages.ClientNegotiation;
var NegotiationType = Negotiation.NegotiationType;

/**
 * Channel which uses the server rtc connection
 * to sent data from and to the clients to initiate
 * a new RTC connection
 */
class Channel extends events.EventEmitter {

    constructor(rtcChannel, negotiationId) {
        super();
        var self = this;
        self.channel = rtcChannel;
        self.negotiationId = negotiationId;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        var channel = self.channel;
        var rtcIcePropagator = function(data) {
            if(self.negotiationId === data.negotiationId) {
                self.emit('icecandidate', data.candidate);
            }
        };
        var rtcOfferPropagator = function(data) {
            if(self.negotiationId === data.negotiationId) {
                self.emit('offer', data.offer);
            }
        };

        channel.on('rtc_icecandidate', rtcIcePropagator);
        channel.on('rtc_offer', rtcOfferPropagator);

        self.once('cleanup', function() {
            channel.removeListener('rtc_icecandidate', rtcIcePropagator);
            channel.removeListener('rtc_offer', rtcOfferPropagator);
        });
    }

    cleanup() {
        var self = this;
        self.emit('cleanup');
    }

    _createNegotiation(type, payload) {
        var self = this;
        var negotiation = new Negotiation(self.negotiationId);
        negotiation.negotiationType = type;
        negotiation.payload = payload;
        return negotiation;
    }

    sendIceCandidate(candidate) {
        var self = this;
        return self.channel.send(
            self._createNegotiation(
                NegotiationType.ICE_CANDIDATE,
                candidate
            )
        );
    }

    sendOffer(offer) {
        var self = this;
        return self.channel.send(
            self._createNegotiation(
                NegotiationType.OFFER,
                offer
            )
        );
    }

    sendOfferResponse(offer) {
        var self = this;
        return self.channel.send(
            self._createNegotiation(
                NegotiationType.OFFER_RESPONSE,
                offer
            )
        );
    }

}

export default Channel;
