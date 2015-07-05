var currentChannelId = 0;

var RTCChannelMock = function () {
    var self = this;
    self.messages = [];
    self.channelId = currentChannelId;
    currentChannelId++;
};

RTCChannelMock.prototype.connect = function (serverRTCChannel) {
    var self = this;
    self.remoteChannel = serverRTCChannel;
};

RTCChannelMock.prototype.send = function (data) {
    var self = this;
    if(self.remoteChannel) {
        setTimeout(self.remoteChannel.onmessage.bind(
            self.remoteChannel,
            {
                data: data
            }
        ), 0);
    } else {
        this.messages.push(data);
    }
};

RTCChannelMock.prototype.onmessage = function() {};

RTCChannelMock.prototype.close = function () {
    var self = this;
    if (self.onclose) {
        setTimeout(self.onclose.bind(self), 0);
    }
};


module.exports.RTCChannelMock = RTCChannelMock;
