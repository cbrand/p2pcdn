var messages = require('./messages/message');
var AbstractChannelHandler = require('../common/rtc/channelHandler');

/**
 * @TODO: Some dependency injection mechanisms would be preferable to this.
 */
var handlers = [
    require('./channelHandlers/chunk'),
    require('./channelHandlers/fileInfo'),
    require('./channelHandlers/init')
];

class ChannelHandler extends AbstractChannelHandler {
    constructor(app, channel) {
        super(channel);
        var self = this;
        self.app = app;
        self.on('message', self.onMessage.bind(self));
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

}

export default ChannelHandler;
