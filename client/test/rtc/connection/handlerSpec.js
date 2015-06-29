var Q = require('q');
var helpers = require('../../helpers');
var expect = require('chai').expect;
helpers.emulateBrowser();

var ConnectionHandler = helpers.require('rtc/connection/handler');

describe('Connection', function () {

    describe('ConnectionHandler', function () {
        var usedHost;
        var usedPort;

        var wsURL = function () {
            return 'ws://' + usedHost + ':' + usedPort + '/api/rtc-negotiation';
        };
        var connectionHandler;

        beforeEach(function () {
            return helpers.startServer().then(function (data) {
                usedHost = data.host;
                usedPort = data.port;
            }).then(function () {
                connectionHandler = new ConnectionHandler(wsURL());
            });
        });

        afterEach(function () {
            return helpers.stopServer();
        });

        it('should be able to connect to the server', function () {
            return connectionHandler.connect().then(function (channel) {
                channel.close();
                connectionHandler.connection.close();
            });
        });

    });

});
