var bindNegotiationChannelEvents = function (negotiationChannel, connection) {
    var self = this;
    var relayOffer = function (offer) {
        self.emit('offer', offer);
    };
    var relayIceCandidate = function (candidate) {
        self.emit('icecandidate', candidate);
    };
    var sendIceCandidate = function (candidate) {
        negotiationChannel.sendIceCandidate(candidate);
    };
    negotiationChannel.on('offer', relayOffer);
    negotiationChannel.on('icecandidate', relayIceCandidate);

    connection.on('icecandidate', sendIceCandidate);
    self.once('cleanup', function () {
        negotiationChannel.removeListener('offer', relayOffer);
        negotiationChannel.removeListener('icecandidate', relayIceCandidate);

        connection.removeListener('icecandidate', sendIceCandidate);
    });
};

var releaseNegotiationChannelEvents = function () {
    var self = this;
    self.emit('cleanup');
};

export {
    bindNegotiationChannelEvents,
    releaseNegotiationChannelEvents
};
