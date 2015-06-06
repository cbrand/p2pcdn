
var wrtc = require('wrtc');

var DataHandler = require('./data_handler');

class Channel {
    constructor() {
        this._initConnection();
    }

    _initConnection() {
        var self = this;
        var connection = self.connection = new wrtc.RTCPeerConnection();
        this.connection.onicecandidate = function(candidate) {
            if(!candidate.candidate) {
                return;
            }
            connection.addIceCandidate(candidate);
        };
    }

    start() {
        var self = this;
        var channel = self.channel = self.createDataChannel('p2pcdn');
        channel.onopen = function() {
            var handler = self.handler = new DataHandler(channel);
            channel.onmessage = function(event) {
                handler.onEvent(event);
            };
        };
    }
}
