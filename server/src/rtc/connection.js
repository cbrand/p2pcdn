var Q = require('q');
var events = require('events');
var wrtc = require('wrtc');

var ChannelHandler = require('./channel_handler');

class Connection extends events.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this._initConnection();
    }

    _initConnection() {
        var self = this;
        var connection = self.connection = new wrtc.RTCPeerConnection();
        connection.onicecandidate = function (candidate) {
            if (!candidate.candidate) {
                return;
            }
            self.emit('icecandidate', candidate.candidate);
        };
    }

    addIceCandidate(candidate) {
        var self = this;
        self.connection.addIceCandidate(candidate);
    }

    start() {
        var self = this;

        self.connection.ondatachannel = function(dataChannelEvent) {
            self.onDataChannel(dataChannelEvent);
        }
    }

    onDataChannel(dataChannelEvent) {
        var channel = dataChannelEvent.channel;
        if (dataChannelEvent.label != 'p2pcdn') {
            // Only allow p2pcdn data channels.
            channel && channel.close();
            return;
        }
        new ChannelHandler(channel);
    }

    setLocalDescription(description) {
        var self = this;
        return Q.Promise(function (resolve, reject) {
            self.connection.setLocalDescription(
                new wrtc.RTCSessionDescription(description),
                resolve.bind(undefined, description),
                reject
            );
        });
    }

    setRemoteDescription(description) {
        var self = this;
        return Q.Promise(function (resolve, reject) {
            self.connection.setRemoteDescription(
                new wrtc.RTCSessionDescription(description),
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
