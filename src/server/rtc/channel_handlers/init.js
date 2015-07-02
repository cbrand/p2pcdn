var Q = require('q');
var Handler = require('./handler');
var messages = require('../messages');


class Init extends Handler {

    supports() {
        return this.message instanceof messages.Init;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Message>}
     */
    handle() {
        return Q(new messages.Init());
    }

}

export default Init;
