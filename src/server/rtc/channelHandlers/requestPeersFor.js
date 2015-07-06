var Handler = require('./handler');
var messages = require('../messages');
var RequestPeersFor = messages.RequestPeersFor;


class RequestPeersFor extends Handler {

    supports() {
        return this.message instanceof RequestPeersFor;
    }

    get orchestrator() {
        return this.app.orchestrator;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Message>}
     */
    handle() {
        var self = this;
        var message = self.message;
        var orchestrator = self.orchestrator;
        orchestrator.on('connection-partial-peer', function(data) {
            orchestrator.newNegotiation(
                self.channel,
                data.connection
            ).then(function(negotiation) {
                    self.channel.send(negotiation);
                });
        });

        orchestrator.requestConnectionToPeer(
            self.channel,
            message.uuid,
            message.neededChunks,
            message.numPeers
        );
    }

}

export default RequestPeersFor;
