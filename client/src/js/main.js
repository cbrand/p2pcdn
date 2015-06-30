
var DetectRTC = require('detectrtc');

DetectRTC.load(function() {
    if(Modernizr.websockets && (DetectRTC.isSctpDataChannelsSupported || DetectRTC.isRtpDataChannelsSupported)) {
        require('./rtc-main');
    } else {
        require('./legacy-main');
    }
});
