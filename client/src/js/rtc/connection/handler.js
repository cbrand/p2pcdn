var Q = require('q');
var events = require('events');
var WebSocketWrapper = require('./ws');
var Connection = require('../connection');
var Negotiation = require('../../messages/negotiation');


class ConnectionHandler extends events.EventEmitter {

    constructor(wsURL) {
        super();
        var self = this;
        self.wsURL = wsURL;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.on('icecandidate', self.handleIceCandidate.bind(self));
    }

    handleIceCandidate(candidate) {
        var self = this;
        var connection = self.connection;
        if (connection && connection.addIceCandidate) {
            connection.addIceCandidate(candidate);
        }
    }

    _initiateWs() {
        var self = this;
        var websocket = new WebSocket(self.wsURL);
        var wrapper = new WebSocketWrapper(websocket);
        wrapper.on('message', function (message) {
            switch (message.type) {
                case Negotiation.Type.OFFER_RESPONSE:
                {
                    self.emit('offer', message.payload);
                    break;
                }
                case Negotiation.Type.ICE_CANDIDATE:
                {
                    self.emit('icecandidate', message.payload);
                    break;
                }
                default:
                {
                    console.warning(
                        'Unkown message type for negotiating peer connection: ' + message.type
                    );
                }
            }
        });

        return new Q.Promise(function (resolve, reject) {
            websocket.on('open', function () {
                resolve(wrapper);
            });
            websocket.once('error', function (err) {
                reject(err);
            });
        });
    }

    _newConnection() {
        var self = this;
        if (self.connection && self.connection.close) {
            // Cleanup old connections.
            self.connection.close();
        }
        var connection = self.connection = new Connection();
        connection.on('icecandidate', function (candidate) {
            self.ws.sendIceCandidate(candidate);
        });

        return connection;
    }

    connect() {
        var self = this;
        var connection;
        var channel;
        var dataChannelOpened = Q.defer();
        return self._initiateWs().then(function (socket) {
            self.ws = socket;
            connection = self._newConnection();
            self.channel = channel = connection.createDataChannel('p2pcdn');
            channel.onopen = dataChannelOpened.resolve;
            return connection.createOfferAndSetLocalDescription();
        }).then(function (offer) {
            self.ws.sendOffer(offer);
            var defer = Q.defer;
            self.once('offer', function (remoteOffer) {
                defer.resolve(remoteOffer);
            });
            return defer.promise;
        }).then(function (remoteOffer) {
            return connection.setRemoteDescription(remoteOffer);
        }).then(dataChannelOpened.promise).then(function () {
            self.ws.close(); // Closing now unnecessary websocket.
        }).then(function () {
            return self.channel;
        });
    }

}

export default ConnectionHandler;
