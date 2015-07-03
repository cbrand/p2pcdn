var Q = require('q');
var _ = require('underscore');
var handlerHelpers = require('./helpers');
var Abstract = require('./base');

var bindNegotiationChannelEvents = handlerHelpers.bindNegotiationChannelEvents;
var releaseNegotiationChannelEvents = handlerHelpers.releaseNegotiationChannelEvents;

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
class AbstractCallerConnectionHandler extends Abstract {

    _connect() {
        var self = this;
        var connection;
        var channel;
        var dataChannelOpened = Q.defer();
        var negotiationChannel;

        var releaseNegotiationChannel = function () {
            if (_.isFunction(self._releaseNegotiationChannel)) {
                self._releaseNegotiationChannel(negotiationChannel);
            }
            releaseNegotiationChannelEvents.call(self);
            negotiationChannel = null;
        };

        return self._getNegotiationChannel().then(function (socket) {
            connection = self._newConnection();
            self.channel = channel = connection.createDataChannel('p2pcdn');
            channel.onopen = function () {
                channel.onopen = function () {
                };
                dataChannelOpened.resolve();
            };

            negotiationChannel = socket;
            bindNegotiationChannelEvents.call(self, negotiationChannel, connection);

            return connection.createOfferAndSetLocalDescription();
        }).then(function (offer) {
            var promises = [];
            promises.push(negotiationChannel.sendOffer(offer));
            var defer = Q.defer();
            self.once('offer', function (remoteOffer) {
                defer.resolve(remoteOffer);
            });
            promises.push(defer.promise);
            return Q.all(promises).then(function(results) {
                // Only interested in the remote offer as of now
                return results[1];
            });
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

export default AbstractCallerConnectionHandler;
