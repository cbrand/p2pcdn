var events = require('events');
var messages = require('./messages/message');
var Message = messages.Message;

/**
 * @TODO: Some dependency injection mechanisms would be preferable to this.
 */
var handlers = [
    require('./channel_handlers/chunk'),
    require('./channel_handlers/file_info')
];

class ChannelHandler extends events.EventEmitter {
    constructor(app, rtcChannel) {
        super();
        var self = this;
        self.app = app;
        self.rtcChannel = rtcChannel;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.rtcChannel.onmessage = self.onEvent.bind(self);
        self.on('message', self.onMessage.bind(self));

        self.on('handler', self.onHandler.bind(self));
    }

    onData(data) {
        var self = this;
        Message.deserialize(data).then(function(message) {
            self.emit('message', message);
        }, function() {
            self.error(messages.Error.Code.UNKNOWN_COMMAND);
        });
    }

    error(code) {
        var self = this;
        self.send(new messages.Error(code));
    }

    onMessage(message) {
        var self = this;
        var handlerFound = false;
        handlers.forEach(function(Handler) {
            var handler = new Handler(self.app, message);
            if(handler.supports()) {
                handlerFound = true;
                self.emit('handler', handler);
            }
        });
        if(!handlerFound) {
            self.error(messages.Error.Code.UNKNOWN_COMMAND);
        }
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

    /**
     * Sends the given response object to the client side of the
     * channel.
     *
     * @param {messages.Message} message
     * @returns Promise
     */
    send(message) {
        var self = this;
        return message.serialize().then(function(data) {
            self.rtcChannel.send(data);
        });
    }

    /**
     * Closes the underlying channel.
     */
    close() {
        var self = this;
        if (self.rtcChannel.close) {
            self.rtcChannel.close();
        }
    }

    onEvent(event) {
        var self = this;
        var data = event.data;
        if(data) {
            self.onData(data);
        }
    }
}

export default ChannelHandler;
