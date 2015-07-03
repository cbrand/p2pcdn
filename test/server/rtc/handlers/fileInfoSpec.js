var Q = require('q');
var temp = require('temp');
var connectionHelper = require('../connectionHelpers');

var helpers = require('../../helpers');
var FileHandler = helpers.require('handlers/file');
var messages = helpers.require('rtc/messages');

require('should');

describe('Connection', function () {
    var clientConnection;
    var serverConnection;
    var clientChannel;
    var config;

    beforeEach(function () {
        temp.track();
        return connectionHelper.bootUpConnection().then(function (data) {
            clientConnection = data.clientConnection;
            serverConnection = data.serverConnection;
            clientChannel = data.clientChannel;
            config = data.config;
        });
    });

    afterEach(function () {
        temp.cleanupSync();
        clientChannel.close();
        clientConnection.close();
        serverConnection.close();
    });

    describe('fileInfo', function() {

        var fileHandler;
        var addedUUID;
        var model;

        beforeEach(function () {
            fileHandler = new FileHandler(config);

            var stream = helpers.readableStream('Random blob data');
            return fileHandler.add('data.blob', stream).then(function (addedModel) {
                model = addedModel;
                addedUUID = addedModel.uuid;
            });
        });

        it('should return an error if a non existing uuid is requested', function() {
            var request = new messages.GetFileInfo('does not exist');

            return request.serialize().then(function (data) {
                return new Q.Promise(function (resolve, reject) {
                    clientChannel.onmessage = function (event) {
                        resolve(event.data);
                    };
                    clientChannel.onerror = function () {
                        reject();
                    };
                    clientChannel.send(data);
                });
            }).then(function (data) {
                return messages.Message.deserialize(data);
            }).then(function (response) {
                response.should.be.an.instanceOf(messages.Error);
                return response;
            }).then(function (error) {
                error.code.should.equal(messages.Error.Code.UUID_NOT_FOUND);
            });
        });

        it('should return the correct file information', function() {
            var request = new messages.GetFileInfo(addedUUID);

            return request.serialize().then(function (data) {
                return new Q.Promise(function (resolve, reject) {
                    clientChannel.onmessage = function (event) {
                        resolve(event.data);
                    };
                    clientChannel.onerror = function () {
                        reject();
                    };
                    clientChannel.send(data);
                });
            }).then(function (data) {
                return messages.Message.deserialize(data);
            }).then(function (response) {
                response.should.be.an.instanceOf(messages.FileInfo);
                return response;
            }).then(function (fileInfo) {
                fileInfo.should.have.property('uuid', addedUUID);
                fileInfo.should.have.property('name', model.fileName);
                fileInfo.should.have.property('mimeType', model.mimeType);
                fileInfo.should.have.property('numChunks', model.numChunks);
                // The server always has all the chunks!
                fileInfo.should.have.property('missingChunks', []);
            });
        });

    });

});
