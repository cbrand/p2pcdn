var events = require('events');

class ChannelHandler extends events.EventEmitter {

    constructor(channel) {
        super();
        var self = this;
        self.channel = channel;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
    }



}
