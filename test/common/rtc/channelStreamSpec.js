var Q = require('q');
var helpers = require('../helpers');
var expect = helpers.chai.expect;
var rtcHelpers = require('./helpers');

var messages;
var channelHandler;

if(helpers.isNode) {
    messages = helpers.require('common/messages/message');
    channelHandler = helpers.require('common/rtc/channelHandler');
} else {
    messages = require('common/messages/message');
    channelHandler = require('common/rtc/channelHandler');
}

describe('ChannelStream', function() {

    var rtcChannel;
    var channel;
    var stream;

    var messagesFor = function(st) {
        var promises = rtcChannel.messages.map(function(data) {
            return messages.Message.deserialize(data);
        });
        return Q.all(promises).then(function(resolvedMessages) {
            return resolvedMessages.filter(function(message) {
                return message.streamId === st.streamId;
            });
        });
    };

    beforeEach(function() {
        rtcChannel = new rtcHelpers.RTCChannelMock();
        channel = new channelHandler(rtcChannel);
        stream = channel.newStream();
    });

    afterEach(function() {
        stream.close();
        channel.close();
    });

    describe('when sending data', function() {
        var message;

        beforeEach(function() {
            message = new messages.Init();
        });

        it('should be able to send data through the stream', function() {
            return stream.send(message).then(function() {
                return messagesFor(stream);
            }).then(function(resolvedMessages) {
                expect(resolvedMessages.length).to.equal(1);
                return resolvedMessages[0];
            }).then(function(data) {
                expect(data.type).to.equal(messages.Message.Type.INIT);
            });
        });

        describe('on connected streams', function() {
            var remoteRtcChannel;
            var remoteChannel;
            var remoteStream;

            beforeEach(function() {
                remoteRtcChannel = new rtcHelpers.RTCChannelMock();
                rtcChannel.connect(remoteRtcChannel);
                remoteRtcChannel.connect(rtcChannel);

                remoteChannel = new channelHandler(remoteRtcChannel);
                remoteStream = remoteChannel.getStream(stream.streamId);
            });

            afterEach(function() {
                remoteChannel.close();
                remoteStream.close();
            });

            it('should ignore data from other streams', function() {
                var otherStream = remoteChannel.newStream();
                otherStream.send(message).then(function() {
                    return messagesFor(stream).to.eventually.equal(0);
                }).finally(function() {
                    otherStream.end();
                });
            });

            it('should accept data from the same stream id', function() {
                remoteStream.send(message);
                return stream.expectMessage().then(function(m) {
                    expect(m.streamId).to.equal(message.streamId);
                });
            });

            it('should create a new stream if a getStream is called with a non existing streamID', function() {
                var otherStream = channel.getStream(5000);
                expect(otherStream.streamId).to.equal(5000);
                otherStream.close();
            });

        });
    });

});
