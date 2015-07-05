var events = require('events');
var messages = require('../../../common/messages/message');

const NEGOTIATION_TIMEOUT = 5000;


class NegotiationHandler extends events.EventEmitter {

    constructor(initPeer, remotePeer) {
        super();
        var self = this;
        self.initPeer = initPeer;
        self.remotePeer = remotePeer;
    }

    init(negotiationId) {
        var self = this;
        self.release();
        self.negotiationId = negotiationId;
        self._connectPeers();
        return self.initMessage();
    }

    _connectPeers() {
        var self = this;
        var initPeer = self.initPeer;
        var remotePeer = self.remotePeer;
        var relayMessage = function(to, message) {
            if(!message instanceof messages.ClientNegotiation) {
                return;
            }

            if(message.id === self.negotiationId) {
                to.send(message);
            }
        };

        var bindPeerToRemotePeer = function(message) {
            return relayMessage(self.remotePeer, message);
        };
        var bindRemotePeerToPeer = function(message) {
            return relayMessage(self.initPeer, message);
        };
        initPeer.on('message', bindPeerToRemotePeer);
        remotePeer.on('message', bindRemotePeerToPeer);

        self.once('release', function() {
            initPeer.removeListener('message', bindPeerToRemotePeer);
            remotePeer.removeListener('message', bindRemotePeerToPeer);
        });
        self.releaseAfterTimeout();
    }

    release() {
        var self = this;
        self.emit('release');
    }

    releaseAfterTimeout() {
        var self = this;
        setTimeout(function() {
            self.release();
        }, NEGOTIATION_TIMEOUT);
    }

    initMessage() {
        var self = this;
        return new messages.InitClientNegotiation(self.negotiationId);
    }

}

export default NegotiationHandler;
