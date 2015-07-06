
class Handler {
    /**
     * @param {App} app
     * @param {Message} message
     * @param {Channel} channel
     */
    constructor(app, message, channel) {
        this.app = app;
        this.message = message;
        this.channel = channel;
    }

    /**
     * returns if the channel handler does support
     * the given request.
     * @returns {boolean}
     */
    supports() {
        return false;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Message>}
     */
    handle() {
        return null;
    }
}

export default Handler;
