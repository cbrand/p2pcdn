var events = require('events');
var messages = require('../messages/message');
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
        self._initEvents();
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
            if(resp instanceof messages.Message) {
                return self.send(resp);
            } else {
                return self.error(messages.Error.Code.UNKNOWN);
            }
        };

        handler.handle().then(handleResponse, handleResponse);
    }

}

export default ChannelHandler;
