var events = require('events');
var messages = require('../messages/message');
var Message = messages.Message;
var MessageType = Message.Type;

/**
 * Wrapper around a common channel handler implementing functions to send information
 * data and should be used as a "client" interface for the communication with a server.
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

    /**
     * Returns a chunk from the remote peer.
     * @param UUID {string} the uuid of the file which chunk part should be downloaded
     * @param chunkNum {Number} the Number of the chunk to download data from.
     */
    getChunk(UUID, chunkNum) {
        var self = this;
        var request = new messages.GetChunk(UUID, chunkNum);
        var stream = self._newStream();
        return stream.sendAndExpectMessage(request).then(function(message) {
            if(message.type === MessageType.CHUNK) {
                return message;
            } else {
                throw message;
            }
        }).then(function(message) {
            if(message.uuid !== UUID || message.chunk !== chunkNum) {
                throw new Error(
                    'Requested chunk number ' + chunkNum + ' and uuid ' + UUID + ' from the remote peer,' +
                    'but got chunk number ' + message.chunk + ' with uuid ' + message.uuid
                );
            }
            return message.data;
        }).finally(function() {
            stream.close();
        });
    }

}

export default ChannelWrapper;
