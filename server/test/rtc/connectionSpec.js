var wrtc = require('wrtc');
var Q = require('q');
var temp = require('temp');
var fs = require('fs');
var path = require('path');
var should = require('should');

var helpers = require('../helpers');
var db = helpers.require('db');
var Connection = helpers.require('rtc/connection');
var Config = helpers.require('config');
var FileHandler = helpers.require('handlers/file');
var messages = helpers.require('rtc/messages');

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
        var config;
        var directory;
        var fileDirectory;

        beforeEach(function () {
            temp.track();
            directory = temp.mkdirSync();
            fileDirectory = path.join(directory, 'files');
            fs.mkdirSync(fileDirectory);

            config = new Config();
            config.config = {
                fileDirectory: fileDirectory,
                database: {
                    type: 'sqlite',
                    path: path.join(directory, 'p2pcdn.db')
                }
            };
            db.init(config.database);
            serverConnection = new Connection(config);
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

            return db.sync().then(function() {
                return initConnection();
            });
        });

        afterEach(function() {
            temp.cleanupSync();
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
            });
        });

        describe('when requesting data', function() {
            var fileHandler;
            var addedUUID;
            var model;

            beforeEach(function() {
                fileHandler = new FileHandler(config);

                var stream = helpers.readableStream("Random blob data");
                return fileHandler.add('data.blob', stream).then(function(addedModel) {
                    model = addedModel;
                    addedUUID = addedModel.uuid;
                });
            });

            it('should be able to request a chunk from through the rtc channel', function() {
                var request = new messages.request.GetChunk(addedUUID, 0);

                return request.serialize().then(function(data) {
                    return new Q.Promise(function(resolve, reject) {
                        clientChannel.send(data);
                        clientChannel.onmessage = function(event) {
                            var data = event.data;
                            resolve(data);
                        };
                        clientChannel.onerror = function() {
                            reject();
                        };
                    })
                }).then(function(data) {
                    return messages.response.Response.deserialize(data);
                }).then(function(response) {
                    response.should.be.an.instanceOf(messages.response.Chunk);
                    return response;
                }).then(function(chunk) {
                    chunk.should.have.property('uuid', addedUUID);
                    return Q.all([chunk, model.chunk(0)]);
                }).then(function(data) {
                    var chunk = data[0];
                    var chunkData = data[1];
                    chunk.should.have.property('data', chunkData);
                });
            });


            it('should return an error if the chunk is out of bounds', function() {
                var request = new messages.request.GetChunk(addedUUID, 0);

                return request.serialize().then(function(data) {
                    return new Q.Promise(function(resolve, reject) {
                        clientChannel.send(data);
                        clientChannel.onmessage = function(event) {
                            var data = event.data;
                            resolve(data);
                        };
                        clientChannel.onerror = function() {
                            reject();
                        };
                    })
                }).then(function(data) {
                    return messages.response.Response.deserialize(data);
                }).then(function(response) {
                    response.should.be.an.instanceOf(messages.response.Error);
                    return response;
                }).then(function(error) {
                    error.code.should.eq(messages.response.Error.Code.CHUNK_OUT_OF_BOUNDS);
                });
            });

        });

        afterEach(function () {
            serverConnection.close();
            clientConnection.close();
        });
    })
})
;
