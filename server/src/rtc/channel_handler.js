var events = require('events');
var messages = require('./messages');
var Request = messages.request.Request;
var response = messages.response;

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
        self.on('request', self.onRequest.bind(self));

        self.on('handler', self.onHandler.bind(self));
    }

    onData(data) {
        var self = this;
        Request.deserialize(data).then(function(request) {
            self.emit('request', request);
        }, function() {
            self.error(response.Error.Code.UNKNOWN_COMMAND);
        });
    }

    error(code) {
        var self = this;
        self.send(new response.Error(code));
    }

    onRequest(request) {
        var self = this;
        var handlerFound = false;
        handlers.forEach(function(Handler) {
            var handler = new Handler(self.app, request);
            if(handler.supports()) {
                handlerFound = true;
                self.emit('handler', handler);
            }
        });
        if(!handlerFound) {
            self.error(response.Error.Code.UNKNOWN_COMMAND);
        }
    }

    onHandler(handler) {
        var self = this;
        var handleResponse = function(resp) {
            if(resp instanceof response.Response) {
                self.send(resp);
            } else {
                self.error(response.Error.Code.UNKNOWN);
            }
        };

        handler.handle().then(handleResponse, handleResponse);
    }

    /**
     * Sends the given response object to the client side of the
     * channel.
     *
     * @param {response.Response} responseObject
     * @returns Promise
     */
    send(responseObject) {
        var self = this;
        responseObject.serialize().then(function(data) {
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
