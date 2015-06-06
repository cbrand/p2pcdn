var wrtc = require('wrtc');
var Q = require('q');

var helpers = require('../helpers');
var Connection = helpers.require('rtc/connection');

describe('Connection', function () {
    var connection;

    var initConnection = function (serverConnection, clientConnection) {
        return Q.Promise(function (resolve, reject) {
            clientConnection.createOffer(function (clientDescriptor) {
                resolve(clientDescriptor);
            }, reject);
        }).then(function (clientDescriptor) {
            return Q.Promise(function (resolve, reject) {
                clientConnection.setLocalDescription(
                    new wrtc.RTCSessionDescription(clientDescriptor),
                    resolve.bind(undefined, clientDescriptor),
                    reject
                );
            });
        }).then(function (clientDescriptor) {
            return serverConnection.setRemoteDescription(clientDescriptor);
        }).then(function () {
            return serverConnection.createAnswerAndSetLocalDescription();
        }).then(function (serverDescriptor) {
            return Q.Promise(function (resolve, reject) {
                clientConnection.setRemoteDescription(
                    new wrtc.RTCSessionDescription(serverDescriptor),
                    resolve.bind(undefined, serverDescriptor),
                    reject
                );
            });
        });
    };

    it('should be able to open a channel connection', function () {
        connection = new Connection();
        connection.start();

        var clientConnection = new wrtc.RTCPeerConnection();
        clientConnection.onicecandidate = function (candidate) {
            if (!candidate.candidate) {
                return;
            }
            connection.addIceCandidate(candidate.candidate);
        };
        connection.on('icecandidate', function (candidate) {
            clientConnection.addIceCandidate(candidate);
        });
        var clientChannel = clientConnection.createDataChannel('p2pcdn');

        return initConnection(connection, clientConnection).then(function () {
            return Q.Promise(function(resolve, reject) {
                clientChannel.onopen = function () {
                    resolve();
                };
                clientChannel.onerror = function(err) {
                    reject(err);
                }
            });
        }).then(function () {
            connection.close();
        }).then(function () {
            clientConnection.close();
        });
    });
});
