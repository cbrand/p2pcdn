var events = require('events');
var Connection = require('../../../connection');
var ChannelHandler = require('../../../channel_handler');

/**
 * An abstract connection handler, which provides common functionality to
 * negotiation RTC connections. This is used by both the RTC initiation
 * with the server and further with the connection to other client peers.
 *
 * The following functions need to be provided:
 *   - _connect()
 *     handles the connection setup. Expected to return a rtc channel.
 *   - _getNegotiationChannel()
 *     has to return a promise eventually resulting to
 *     a opened channel which should be used to communicate
 *     negotiation messages through.
 *     The channel has to have at least the following methods:
 *          - sendIceCandidate(candidate): Promise
 *            has to send the ice candidate to the remote peer.
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
class AbstractBaseConnectionHandler extends events.EventEmitter {
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

    get _rightFlags() {
        return {
            rtc: false
        };
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
        return self._connect().then(function(channel) {
            return new ChannelHandler(channel, self._rightFlags);
        });
    }
}

export default AbstractBaseConnectionHandler;
