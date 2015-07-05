var Q = require('q');
var Handler = require('./handler');
var messages = require('../messages');


class ClientNegotiation extends Handler {

    supports() {
        return this.message instanceof messages.ClientNegotiation;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Message>}
     */
    handle() {
        var self = this;
        self.app.emit('client-negotiation', self.message);
    }

}

export default ClientNegotiation;
