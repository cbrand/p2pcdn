var _ = require('underscore');
var Q = require('q');
var events = require('events');
var Connection = require('../../connection');

/**
 * An abstract connection handler, which provides common functionality to
 * negotiation RTC connections. This is used by both the RTC initiation
 * with the server and further with the connection to other client peers.
 *
 * The following functions need to be provided:
 *   - _getNegotiationChannel()
 *     has to return a promise eventually resulting to
 *     a opened channel which should be used to communicate
 *     negotiation messages through.
 *     The channel has to have at least the following methods:
 *          - sendIceCandidate(candidate): Promise
 *            has to send the ice candidate to the remote peer.
 *          - sendOffer(offer): Promise
 *            has to send an rtc offer to the server.
 *     Additionally the channel has to provide the following events:
 *          - offer: Should have as a first argument the remote rtc offer
 *                   in string form.
 *          - icecandidate: Should return icecandidates being responded from
 *                          by the server.
 * Optionally the handler also MAY provide the following functionality:
 *   - _releaseNegotiationChannel(channel)
 *     Frees up allocated resources if necessary. The channel is seen as no
 *     longer needed.
 */
class AbstractConnectionHandler extends events.EventEmitter {

    constructor() {
        super();
        var self = this;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.on('icecandidate', self.handleIceCandidate.bind(self));
    }

    _newConnection() {
        var self = this;
        if (self.connection && self.connection.close) {
            // Cleanup old connections.
            self.connection.close();
        }
        self.connection = new Connection();
        return self.connection;
    }

    handleIceCandidate(candidate) {
        var self = this;
        var connection = self.connection;
        if (connection && connection.addIceCandidate) {
            connection.addIceCandidate(candidate);
        }
    }

    connect() {
        var self = this;
        var connection;
        var channel;
        var dataChannelOpened = Q.defer();
        var negotiationChannel;

        var relayOffer = function (offer) {
            self.emit('offer', offer);
        };
        var relayIceCandidate = function (candidate) {
            self.emit('icecandidate', candidate);
        };
        var sendIceCandidate = function(candidate) {
            negotiationChannel.sendIceCandidate(candidate);
        };

        var bindNegotiationChannelEvents = function (negotiationChannel, connection) {
            negotiationChannel.on('offer', relayOffer);
            negotiationChannel.on('icecandidate', relayIceCandidate);

            connection.on('icecandidate', sendIceCandidate);
        };
        var releaseNegotiationChannelEvents = function (negotiationChannel, connection) {
            negotiationChannel.removeListener('offer', relayOffer);
            negotiationChannel.removeListener('icecandidate', relayIceCandidate);

            connection.removeListener('icecandidate', sendIceCandidate);
        };


        var releaseNegotiationChannel = function () {
            if (_.isFunction(self._releaseNegotiationChannel)) {
                self._releaseNegotiationChannel(negotiationChannel);
            }
            releaseNegotiationChannelEvents.call(this, negotiationChannel, connection);
            negotiationChannel = null;
        };

        return self._getNegotiationChannel().then(function (socket) {
            connection = self._newConnection();
            self.channel = channel = connection.createDataChannel('p2pcdn');
            channel.onopen = function() {
                channel.onopen = function() {};
                dataChannelOpened.resolve();
            };

            negotiationChannel = socket;
            bindNegotiationChannelEvents.call(this, negotiationChannel, connection);

            return connection.createOfferAndSetLocalDescription();
        }).then(function (offer) {
            negotiationChannel.sendOffer(offer);
            var defer = Q.defer();
            self.once('offer', function (remoteOffer) {
                defer.resolve(remoteOffer);
            });
            return defer.promise;
        }).then(function (remoteOffer) {
            return connection.setRemoteDescription(remoteOffer);
        }).thenResolve(
            dataChannelOpened.promise
        ).then(releaseNegotiationChannel).then(function () {
                return channel;
            }).catch(
            /* istanbul ignore next */
            function (err) {
                try {
                    releaseNegotiationChannel();
                }
                catch (releaseErr) {
                    // Ok for now. We are more interested in the actual error.
                    console.warning(releaseErr);
                }
                throw err;
            });
    }

}

export default AbstractConnectionHandler;
