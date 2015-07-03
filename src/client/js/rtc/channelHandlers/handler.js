
class Handler {
    /**
     * @param {Message} message
     * @param {Channel} channel
     */
    constructor(message, channel) {
        this.message = message;
        this.channel = channel;
    }

    get app() {
        return this.channel.app;
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
