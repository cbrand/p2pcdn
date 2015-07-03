var Q = require('q');
var events = require('events');
var wrtc = require('wrtc');

var ChannelHandler = require('./channelHandler');


class Connection extends events.EventEmitter {
    constructor(app) {
        super();
        this.app = app;
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

        self.connection.ondatachannel = self.onDataChannel.bind(self);
    }

    onDataChannel(dataChannelEvent) {
        var self = this;
        var channel = dataChannelEvent.channel;

        self.emit('datachannel', channel);
        var dataChannel = new ChannelHandler(self.app, channel);
        self.emit('datachannelhandler', dataChannel);
        return dataChannel;
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
