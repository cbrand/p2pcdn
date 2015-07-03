var Q = require('q');
var helpers = require('../../../helpers');
helpers.emulateBrowser();

var rtcHelpers = require('./helpers');
var RTCChannelMock = rtcHelpers.RTCChannelMock;

var RTCChannelHandler = helpers.require('rtc/channel_handler');
var RTCCallerConnectionHandler = helpers.require('rtc/connection/handler/throughRTC/caller');
var RTCCalleeConnectionHandler = helpers.require('rtc/connection/handler/throughRTC/callee');


describe('Connection', function () {

    describe('throughRTCHandler', function () {
        var calleeRTCChannelMock;
        var callerRTCChannelMock;

        var rtcCalleeChannelHandler;
        var rtcCallerChannelHandler;

        beforeEach(function() {
            callerRTCChannelMock = new RTCChannelMock();
            calleeRTCChannelMock = new RTCChannelMock();
            calleeRTCChannelMock.connect(callerRTCChannelMock);
            callerRTCChannelMock.connect(calleeRTCChannelMock);

            rtcCalleeChannelHandler = new RTCChannelHandler(calleeRTCChannelMock, {
                rtc: true
            });
            rtcCallerChannelHandler = new RTCChannelHandler(callerRTCChannelMock, {
                rtc: true
            });
        });

        it('should be able to connect two clients together', function() {
            var negotiationId = 'this-is-just-random-data';

            var rtcCallerConnectionHandler = new RTCCallerConnectionHandler(
                rtcCallerChannelHandler,
                negotiationId);

            var rtcCalleeConnectionHandler;

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
            }).then(function() {
                    return Q.all(promises);
                }).then(function(channels) {
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
