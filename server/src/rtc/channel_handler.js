
class ChannelHandler {
    constructor(rtcChannel) {
        var self = this;
        self.rtcChannel = rtcChannel;
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.rtcChannel.onmessage = self.onEvent.bind(self);
    }

    onData(data) {
        var self = this;
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
