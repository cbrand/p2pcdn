var wrtc = require('wrtc');
var Q = require('q');

var helpers = require('../helpers');
var Connection = helpers.require('rtc/connection');

describe('Connection', function () {
    var serverConnection;
    var clientConnection;

    var initConnection = function () {
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

        return initConnection().then(function () {
            return Q.Promise(function (resolve, reject) {
                clientChannel.onopen = function () {
                    resolve();
                };
                clientChannel.onerror = function (err) {
                    reject(err);
                }
            });
        }).then(function () {
            serverConnection.close();
        }).then(function () {
            clientConnection.close();
        });
    });

    describe('when connected', function () {
        var clientChannel;

        beforeEach(function () {
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
            clientChannel = clientConnection.createDataChannel('p2pcdn');
            return initConnection();
        });

        it('should reject data channels which aren\'t marked as p2pcdn', function () {
            var otherChannel = clientConnection.createDataChannel('notp2pcnd');

            var createEventPromise = function(name) {
                return Q.Promise(function(resolve, reject) {
                    otherChannel.addEventListener(name, function() {
                        resolve();
                    });
                    otherChannel.addEventListener('error', function() {
                        reject();
                    });
                });
            };

            return createEventPromise('open').then(function() {
                return createEventPromise('close');
            })
        });

        afterEach(function () {
            serverConnection.close();
            clientConnection.close();
        });
    })
})
;
