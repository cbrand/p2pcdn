var Q = require('q');
var events = require('events');
var messages = require('../messages/message');

const TIMEOUT = 5000;

class ChannelStream extends events.EventEmitter {

    /**
     *
     * @param streamId {Number} the id of the stream which is being used to track
     *                          the messages in this stream.
     * @param channel {ChannelWrapper} The default channel handler.
     */
    constructor(streamId, channel) {
        super();
        var self = this;
        self.streamId = streamId;
        self.channel = channel;
        self._initEvents();
    }

    close() {
        var self = this;
        self.emit('close');
    }

    _initEvents() {
        var self = this;
        var channel = self.channel;
        channel.on('message', function(message) {
            if(message.streamId === self.streamId) {
                self.emit('message', message);
            }
        });
        channel.on('error', function(error) {
            self.emit('error', error);
        });
        channel.on('close', function() {
            self.close();
        });
    }

    send(message) {
        var self = this;
        message.streamId = self.streamId;
        return self.channel.send(message);
    }

    expectMessage() {
        var self = this;
        var defer = Q.defer();
        var errorResponse = new messages.Error(messages.Error.Code.TIMEOUT);
        errorResponse.streamId = self.streamId;

        self.on('message', function(message) {
            defer.resolve(message);
        });

        return defer.promise.timeout(TIMEOUT, errorResponse);
    }

    sendAndExpectMessage(message) {
        var self = this;
        return self.send(message).thenResolve(
            self.expectMessage()
        );
    }

}

export default ChannelStream;
