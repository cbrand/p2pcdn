var Q = require('q');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('underscore');
chai.use(chaiAsPromised);

var blobToBase64URL = function(blob) {
    var defer = Q.defer();
    var reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        defer.resolve(reader.result);
    };
    return defer.promise;
};
var blobToBase64 = function(blob) {
    return blobToBase64URL(blob).then(function(data) {
        return data.slice(_.indexOf(data, ',') + 1);
    });
};

module.exports.chai = chai;
module.exports.blobToBase64URL = blobToBase64URL;
module.exports.blobToBase64 = blobToBase64;
exports.connectedChannels = function(app) {
    var RTCChannelMock = require('../../common/rtc/helpers').RTCChannelMock;
    var ChannelHandler = require('rtc/channelHandler');

    var firstChannelMock = new RTCChannelMock();
    var secondChannelMock = new RTCChannelMock();
    firstChannelMock.connect(secondChannelMock);
    secondChannelMock.connect(firstChannelMock);

    var firstChannelWrapper = new ChannelHandler(firstChannelMock, {
        app: app || null
    });
    var secondChannelWrapper = new ChannelHandler(secondChannelMock, {
        app: app || null
    });

    return {
        channel: {
            left: firstChannelMock,
            right: secondChannelMock
        },
        handler: {
            left: firstChannelWrapper,
            right: secondChannelWrapper
        }
    };
};
