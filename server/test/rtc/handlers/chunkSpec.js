var Q = require('q');
var temp = require('temp');
var should = require('should');
var connectionHelper = require('../connectionHelpers');

var helpers = require('../../helpers');
var Connection = helpers.require('rtc/connection');
var FileHandler = helpers.require('handlers/file');
var messages = helpers.require('rtc/messages');

describe('Connection', function () {
    var clientConnection;
    var serverConnection;
    var clientChannel;
    var config;

    beforeEach(function () {
        temp.track();
        return connectionHelper.bootUpConnection().then(function(data) {
            clientConnection = data.clientConnection;
            serverConnection = data.serverConnection;
            clientChannel = data.clientChannel;
            config = data.config;
        })
    });

    afterEach(function () {
        temp.cleanupSync();
        clientChannel.close();
        clientConnection.close();
        serverConnection.close();
    });

    describe('when requesting data', function () {
        var fileHandler;
        var addedUUID;
        var model;

        beforeEach(function () {
            fileHandler = new FileHandler(config);

            var stream = helpers.readableStream("Random blob data");
            return fileHandler.add('data.blob', stream).then(function (addedModel) {
                model = addedModel;
                addedUUID = addedModel.uuid;
            });
        });

        it('should be able to request a chunk from through the rtc channel', function () {
            var request = new messages.request.GetChunk(addedUUID, 0);

            return request.serialize().then(function (data) {
                return new Q.Promise(function (resolve, reject) {
                    clientChannel.onmessage = function (event) {
                        var data = event.data;
                        resolve(data);
                    };
                    clientChannel.onerror = function () {
                        reject();
                    };
                    clientChannel.send(data);
                })
            }).then(function (data) {
                return messages.response.Response.deserialize(data);
            }).then(function (response) {
                response.should.be.an.instanceOf(messages.response.Chunk);
                return response;
            }).then(function (chunk) {
                chunk.should.have.property('uuid', addedUUID);
                return Q.all([chunk, model.chunk(0)]);
            }).spread(function (chunk, chunkData) {
                chunk.should.have.property('data');
                chunk.data.toString('utf8').should.equal(chunkData);
            });
        });


        it('should return an error if the chunk is out of bounds', function () {
            var request = new messages.request.GetChunk(addedUUID, 3000);

            return request.serialize().then(function (data) {
                return new Q.Promise(function (resolve, reject) {
                    clientChannel.send(data);
                    clientChannel.onmessage = function (event) {
                        var data = event.data;
                        resolve(data);
                    };
                    clientChannel.onerror = function () {
                        reject();
                    };
                })
            }).then(function (data) {
                return messages.response.Response.deserialize(data);
            }).then(function (response) {
                response.should.be.an.instanceOf(messages.response.Error);
                return response;
            }).then(function (error) {
                error.code.should.equal(messages.response.Error.Code.CHUNK_OUT_OF_BOUNDS);
            });
        });

        it('should return an error if the chunk is requested from a not existing uuid', function () {
            var request = new messages.request.GetChunk('doesnotexist', 0);

            return request.serialize().then(function (data) {
                return new Q.Promise(function (resolve, reject) {
                    clientChannel.send(data);
                    clientChannel.onmessage = function (event) {
                        var data = event.data;
                        resolve(data);
                    };
                    clientChannel.onerror = function () {
                        reject();
                    };
                })
            }).then(function (data) {
                return messages.response.Response.deserialize(data);
            }).then(function (response) {
                response.should.be.an.instanceOf(messages.response.Error);
                return response;
            }).then(function (error) {
                error.code.should.equal(messages.response.Error.Code.UUID_NOT_FOUND);
            });
        });
    });

})
