var _ = require('underscore');
var events = require('events');
var messages = require('../messages/message');
var ChannelStream = require('./channelStream');
var Message = messages.Message;

/**
 * Abstract handler which combines functionality to communicate through
 * the webrtc channels both on the client and on the server side.
 */
class ChannelHandler extends events.EventEmitter {

    constructor(channel) {
        super();
        var self = this;
        self.channel = channel;
        self.streams = {};
        self._initEvents();
    }

    _unusedStreamID() {
        var self = this;

        var streamID = 0;
        var currentStreamIDs = _.keys(self.streams);

        while(_.contains(currentStreamIDs, streamID)) {
            streamID = streamID + 1;
        }

        return streamID;
    }

    /**
     * Returns a new stream with a unique stream ID for this
     * channel.
     */
    newStream() {
        var self = this;
        var newStreamID = self._unusedStreamID();
        var stream = self.streams[newStreamID] = new ChannelStream(newStreamID, self);
        stream.once('close', function() {
            delete self.streams[newStreamID];
        });
        return stream;
    }

    getStream(streamID) {
        var self = this;
        var stream = self.streams[streamID];
        if(!stream) {
            stream = self.streams[streamID] = new ChannelStream(streamID, self);
            stream.once('close', function() {
                delete self.streams[streamID];
            });
        }
        return stream;
    }

    /**
     * Sends the given message object to the client side of the
     * channel.
     *
     * @param {messages.Message} message
     * @returns Promise
     */
    send(message) {
        var self = this;
        return message.serialize().then(function(data) {
            self.channel.send(data);
        });
    }

    error(code) {
        var self = this;
        self.send(new messages.Error(code));
    }

    /**
     * Closes the underlying channel.
     */
    close() {
        var self = this;
        if (self.channel.close) {
            self.channel.close();
        }
    }

    _initEvents() {
        var self = this;
        self.channel.onmessage = self.onEvent.bind(self);
        self.channel.onclose = function() {
            self.emit('close');
        };
        self.channel.onerror = function(err) {
            self.emit('error', err);
        };
        self.channel.onopen = function() {
            self.emit('open');
        };

        self.on('data', self.onData.bind(self));
        self.on('handler', self.onHandler.bind(self));
    }

    onEvent(event) {
        var self = this;
        var data = event.data;
        if(data) {
            self.emit('data', data);
        }
    }

    onData(data) {
        var self = this;
        Message.deserialize(data).then(function(message) {
            self.emit('message', message);
        }, function() {
            self.error(messages.Error.Code.UNKNOWN_COMMAND);
        });
    }

    onHandler(handler) {
        var self = this;
        var handleResponse = function(resp) {
            if(!resp) {
                // There are commands having no response, thus
                // no one should be sent.
                return;
            }

            if(resp instanceof messages.Message) {
                return self.send(resp);
            } else {
                return self.error(messages.Error.Code.UNKNOWN);
            }
        };

        handler.handle().then(function(responseMessage) {
            if(!responseMessage) {
                return responseMessage;
            }
            var streamId = handler.message.streamId;

            if(streamId) {
                responseMessage.streamId = streamId;
            }
            return responseMessage;
        }).then(handleResponse, handleResponse);
    }

}

export default ChannelHandler;
