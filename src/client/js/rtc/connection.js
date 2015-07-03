var Q = require('q');
var events = require('events');
var rtc = require('./connection/rtc');
var RTCPeerConnection = rtc.PeerConnection;
var RTCSessionDescription = rtc.SessionDescription;

class Connection extends events.EventEmitter {
    constructor() {
        super();
        this._initConnection();
    }

    _initConnection() {
        var self = this;
        var connection = self.connection = new RTCPeerConnection();
        connection.onicecandidate = function (candidate) {
            if (!candidate.candidate) {
                return;
            }
            self.emit('icecandidate', candidate.candidate);
        };
        connection.ondatachannel = self.onDataChannel.bind(self)
    }

    createOffer(options) {
        var self = this;
        var defer = Q.defer();
        self.connection.createOffer(
            defer.resolve,
            defer.reject,
            options
        );
        return defer.promise;
    }

    createDataChannel(label) {
        var self = this;
        return self.connection.createDataChannel(label);
    }

    addIceCandidate(candidate) {
        var self = this;
        self.connection.addIceCandidate(candidate);
    }

    start() {
        var self = this;

        self.connection.ondatachannel = function(dataChannelEvent) {
            self.onDataChannel(dataChannelEvent);
        };
    }

    onDataChannel(dataChannelEvent) {
        var self = this;
        var channel = dataChannelEvent.channel;
        self.emit('datachannel', channel);
    }

    createOfferAndSetLocalDescription(options) {
        var self = this;
        return self.createOffer(options).then(function(offer) {
            return self.setLocalDescription(offer);
        });
    }

    setLocalDescription(description) {
        var self = this;
        return Q.Promise(function (resolve, reject) {
            self.connection.setLocalDescription(
                new RTCSessionDescription(description),
                resolve.bind(undefined, description),
                reject
            );
        });
    }

    setRemoteDescription(description) {
        var self = this;
        return Q.Promise(function (resolve, reject) {
            self.connection.setRemoteDescription(
                new RTCSessionDescription(description),
                resolve.bind(undefined, description),
                reject
            );
        });
    }

    createAnswer() {
        var self = this;
        return Q.Promise(function (resolve, reject) {
            self.connection.createAnswer(
                resolve,
                reject
            );
        });
    }

    createAnswerAndSetLocalDescription() {
        var self = this;
        return self.createAnswer().then(function (description) {
            return self.setLocalDescription(description);
        });
    }

    close() {
        var self = this;
        self.connection.close();
    }
}

export default Connection;
