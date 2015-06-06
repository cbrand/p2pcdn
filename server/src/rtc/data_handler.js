
class DataHandler {
    constructor(rtcChannel) {
        this.rtcChannel = rtcChannel;
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

export default DataHandler;
