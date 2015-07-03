var Q = require('q');
var AbstractHandler = require('./abstract/caller');
var WebSocketWrapper = require('./serverWs/channel');

class ServerWsHandler extends AbstractHandler {

    constructor(wsURL) {
        super();
        var self = this;
        self.wsURL = wsURL;
    }

    get _rightFlags() {
        return {
            rtc: true
        };
    }

    _getNegotiationChannel() {
        var self = this;
        var websocket = new WebSocket(self.wsURL);

        return new Q.Promise(function (resolve, reject) {
            websocket.on('open', function () {
                resolve(new WebSocketWrapper(websocket));
            });
            websocket.once('error', function (err) {
                reject(err);
            });
        });
    }

    _releaseNegotiationChannel(channel) {
        if(channel && channel.close) {
            channel.close();
        }
    }

}

export default ServerWsHandler;
