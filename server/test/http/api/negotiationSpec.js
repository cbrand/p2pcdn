var portfinder = require('portfinder');
var Q = require('q');
var NodeWebSocket = require('ws');
var wrtc = require('wrtc');
var helpers = require('../../helpers');
var apiHelpers = require('./helpers');
var expect = require('chai').expect;

var Negotiation = helpers.require('http/api/negotiation/negotiation');

require('should');


describe('http', function () {

    var app;

    beforeEach(function () {
        return apiHelpers.setUp().then(function (data) {
            app = data.app;
        });
    });

    afterEach(function () {
        return apiHelpers.tearDown();
    });

    describe('negotiation', function () {
        var usedHost = 'localhost';
        var usedPort;
        var startedServer;
        var wsURL = function () {
            return 'ws://' + usedHost + ':' + usedPort + '/api/rtc-negotiation';
        };

        beforeEach(function () {
            return new Q.Promise(function (resolve, reject) {
                portfinder.getPort({
                    host: usedHost,
                    port: 40000
                }, function (err, port) {
                    if (!err) {
                        resolve(port);
                    } else {
                        reject(err);
                    }
                });
            }).then(function (port) {
                    usedPort = port;
                    return new Q.Promise(function (resolve, reject) {
                        startedServer = app.listen(port, usedHost, function (err) {
                            if (!err) {
                                resolve();
                            } else {
                                reject(err);
                            }
                        });
                    });
                });

        });

        afterEach(function () {
            app.emit('close');
            return new Q.Promise(function(resolve) {
                startedServer.on('close', resolve);
                startedServer.close();
            });
        });

        var connectWS = function () {
            var socket = new NodeWebSocket(wsURL());
            return new Q.Promise(function (resolve, reject) {
                socket.on('open', function () {
                    resolve(socket);
                });
                socket.on('error', function (err) {
                    reject(err);
                });
            });
        };

        it('should be able to connect through a websocket to the server', function () {
            return connectWS().then(function (socket) {
                var q = Q.defer();
                socket.close();
                var states = {
                    CONNECTING: 0,
                    OPEN: 1,
                    CLOSING: 2,
                    CLOSED: 3
                };
                expect(socket.readyState).to.equal(states.CLOSING);
                socket.onclose = function() {
                    expect(socket.readyState).to.equal(states.CLOSED);
                    q.resolve();
                };
                return q.promise;
            });
        });

        it('should be able to start a peer to peer webrtc connection through the protocol negotiation', function () {
            var usedSocket;
            var clientChannel;
            var clientConnection;
            var offerResponse = Q.defer();
            var dataChannelOpened = Q.defer();

            return connectWS().then(function (socket) {
                usedSocket = socket;
                usedSocket.on('message', function (message) {
                    Negotiation.deserialize(message).then(function (negotiation) {
                        switch (negotiation.type) {
                            case Negotiation.Type.OFFER_RESPONSE:
                            {
                                offerResponse.resolve(negotiation.payload);
                                break;
                            }
                            case Negotiation.Type.ICE_CANDIDATE:
                            {
                                clientConnection.addIceCandidate(negotiation.payload);
                                break;
                            }
                            default:
                            {
                                offerResponse.reject(new Error('Unkown message type'));
                            }
                        }
                    });
                });

                clientConnection = new wrtc.RTCPeerConnection();
                clientConnection.onicecandidate = function (candidate) {
                    if (!candidate.candidate) {
                        return;
                    }
                    var icecandidate = new Negotiation();
                    icecandidate.type = Negotiation.Type.ICE_CANDIDATE;
                    icecandidate.payload = candidate.candidate;

                    icecandidate.serialize().then(function (data) {
                        socket.send(data);
                    });
                };

                clientChannel = clientConnection.createDataChannel('p2pcdn');
                clientChannel.onopen = dataChannelOpened.resolve;

                return new Q.Promise(function (resolve) {
                    clientConnection.createOffer(function (clientOffer) {
                        resolve(clientOffer);
                    });
                });
            }).then(function (clientOffer) {
                return new Q.Promise(function (resolve, reject) {
                    clientConnection.setLocalDescription(
                        new wrtc.RTCSessionDescription(clientOffer),
                        resolve.bind(undefined, clientOffer),
                        reject
                    );
                });
            }).then(function (clientOffer) {
                var offerMessage = new Negotiation();
                offerMessage.type = Negotiation.Type.OFFER;
                offerMessage.payload = clientOffer;

                return offerMessage.serialize();
            }).then(function (data) {
                usedSocket.send(data);
                return offerResponse.promise;
            }).then(function (serverOffer) {
                var defer = Q.defer();
                clientConnection.setRemoteDescription(
                    new wrtc.RTCSessionDescription(serverOffer),
                    defer.resolve,
                    defer.reject
                );
                return defer.promise;
            }).then(
                dataChannelOpened
            ).then(function () {
                    clientConnection.close();
                    usedSocket.close();
                });
        });

    });

});
