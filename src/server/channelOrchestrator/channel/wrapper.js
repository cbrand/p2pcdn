var Q = require('q');
var events = require('events');
var messages = require('../../common/messages/message');
var Message = messages.Message;
var MessageType = Message.Type;

/**
 * Wrapper around a common channel handler implementing functions to send information
 * data.
 */
class ChannelWrapper extends events.EventEmitter {

    constructor(channel) {
        super();
        var self = this;
        self.channel = channel;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        var channel = self.channel;
        self.close = channel.close.bind(channel);
        self.send = channel.send.bind(self);

        var bindChannelFunc = function (name) {
            self.channel.on(name, function () {
                var args = [name];
                self.emit.apply(self, args.concat(arguments));
            });
        };
        ['message', 'error', 'close', 'data'].forEach(function (evtName) {
            bindChannelFunc(evtName);
        });

        self.on('message', self.onMessage.bind(self));
    }

    onMessage(message) {
        var self = this;
        switch (message.type) {
            case MessageType.FILE_INFO:
                self.emit('fileinfo', message);
                break;
            case MessageType.CHUNK:
                self.emit('chunk', message);
                break;
        }
    }

    /**
     * Returns a new stream from the underlying channel.
     * @private
     */
    _newStream() {
        return this.channel.newStream();
    }

    /**
     * Returns the file information for the given entry.
     * @param UUID
     */
    requestFileInfo(UUID) {
        var self = this;
        var request = new messages.GetFileInfo(UUID);
        var stream = self._newStream();

        return stream.sendAndExpectMessage(request).then(function(message) {
            if(message.type === MessageType.FILE_INFO) {
                if(message.UUID === UUID) {
                    throw new Error('The message returned has the wrong file UUID (got ' +
                            message.UUID + ' expected ' + UUID +
                            ')');
                }

                return message;
            } else {
                throw message;
            }
        }).finally(function() {
            stream.close();
        });
    }

}

export default ChannelWrapper;
