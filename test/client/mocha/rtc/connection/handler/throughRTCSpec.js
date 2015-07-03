var Q = require('q');
var events = require('events');
var helpers = require('../../../helpers');
helpers.emulateBrowser();

var rtcHelpers = require('./helpers');
var RTCChannelMock = rtcHelpers.RTCChannelMock;

var RTCChannelHandler = helpers.require('rtc/channel_handler');
var RTCCallerConnectionHandler = helpers.require('rtc/connection/handler/throughRTC/caller');
var RTCCalleeConnectionHandler = helpers.require('rtc/connection/handler/throughRTC/callee');


describe('Connection', function () {

    describe('throughRTCHandler', function () {
        var negotiationId;

        var app;
        var appTriggered;

        var calleeRTCChannelMock;
        var callerRTCChannelMock;

        var rtcCalleeChannelHandler;
        var rtcCallerChannelHandler;

        var rtcCallerConnectionHandler;
        var rtcCalleeConnectionHandler;

        beforeEach(function() {
            negotiationId = 'this-is-just-random-data';

            app = new events.EventEmitter();
            appTriggered = new Q.Promise(function(resolve) {
                app.on('channel', function(channel) {
                    resolve(channel);
                });
            });

            callerRTCChannelMock = new RTCChannelMock();
            calleeRTCChannelMock = new RTCChannelMock();
            calleeRTCChannelMock.connect(callerRTCChannelMock);
            callerRTCChannelMock.connect(calleeRTCChannelMock);

            rtcCalleeChannelHandler = new RTCChannelHandler(calleeRTCChannelMock, {
                rights: {
                    rtc: true
                }
            });
            rtcCallerChannelHandler = new RTCChannelHandler(callerRTCChannelMock, {
                rights: {
                    rtc: true
                }
            });
        });

        var connect = function() {
            rtcCallerConnectionHandler = new RTCCallerConnectionHandler(
                rtcCallerChannelHandler,
                negotiationId,
                app);

            rtcCalleeConnectionHandler;

            var promises = [];

            return new Q.Promise(function(resolve, reject) {
                rtcCalleeChannelHandler.once('new_rtc_offer', function(data) {
                    try {
                        rtcCalleeConnectionHandler = new RTCCalleeConnectionHandler(
                            rtcCalleeChannelHandler,
                            data.negotiationId,
                            data.offer
                        );
                        promises.push(rtcCalleeConnectionHandler.connect());
                        resolve();
                    } catch(err) {
                        reject(err);
                    }
                });
                promises.push(rtcCallerConnectionHandler.connect());
                return Q.all(promises);
            });
        };

        it('should be able to connect two clients together', function() {
            connect().then(function(channels) {
                    channels.forEach(function(channel) {
                        channel.close();
                    });
                }).then(function() {
                    rtcCallerConnectionHandler.connection.close();
                    rtcCalleeConnectionHandler.connection.close();
                });

        });

        it('should trigger the channel event on the passed app if an app is passed.', function() {
            connect().thenResolve(appTriggered)
                .then(function(channels) {
                    channels.forEach(function(channel) {
                        channel.close();
                    });
                }).then(function() {
                    rtcCallerConnectionHandler.connection.close();
                    rtcCalleeConnectionHandler.connection.close();
                });

        });

    });

});
