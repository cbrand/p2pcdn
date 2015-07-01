var messages = require('../messages/message');
var AbstractChannelHandler = require('../common/rtc/channel_handler');

var handlers = [
    require('./channel_handlers/file_handler')
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
