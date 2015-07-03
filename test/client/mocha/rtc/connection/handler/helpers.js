
var RTCChannelMock = function () {

};

RTCChannelMock.prototype.connect = function (serverRTCChannel) {
    var self = this;
    self.remoteChannel = serverRTCChannel;
};

RTCChannelMock.prototype.send = function (data) {
    var self = this;
    setTimeout(self.remoteChannel.onmessage.bind(
        self.remoteChannel,
        {
            data: data
        }
    ), 0);
};

RTCChannelMock.prototype.close = function () {
    var self = this;
    if (self.onclose) {
        setTimeout(self.onclose.bind(self), 0);
    }
};


module.exports.RTCChannelMock = RTCChannelMock;
