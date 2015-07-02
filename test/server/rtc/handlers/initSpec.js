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
        return connectionHelper.bootUpConnection().then(function(data) {
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

    describe('init', function () {

        it('should return an init call with an init response', function () {
            var request = new messages.Init();

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
                response.should.be.an.instanceOf(messages.Init);
                return response;
            });
        });

    });

});
