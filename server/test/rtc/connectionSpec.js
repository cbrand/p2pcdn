var wrtc = require('wrtc');
var Q = require('q');
var connectionHelper = require('./connectionHelpers');

var helpers = require('../helpers');
var Connection = helpers.require('rtc/connection');

require('should');

describe('Connection', function () {
    var serverConnection;
    var clientConnection;

    it('should be able to open a channel connection', function () {
        serverConnection = new Connection();
        serverConnection.start();

        clientConnection = new wrtc.RTCPeerConnection();
        clientConnection.onicecandidate = function (candidate) {
            if (!candidate.candidate) {
                return;
            }
            serverConnection.addIceCandidate(candidate.candidate);
        };
        serverConnection.on('icecandidate', function (candidate) {
            clientConnection.addIceCandidate(candidate);
        });
        var clientChannel = clientConnection.createDataChannel('p2pcdn');

        return connectionHelper.initConnection(serverConnection, clientConnection)
            .then(function () {
                return Q.Promise(function (resolve, reject) {
                    clientChannel.onopen = function () {
                        resolve();
                    };
                    clientChannel.onerror = function (err) {
                        reject(err);
                    };
                });
            }).then(function () {
                serverConnection.close();
            }).then(function () {
                clientConnection.close();
            });
    });

})
;
