
class Handler {
    /**
     * @param {Message} message
     */
    constructor(message) {
        this.message = message;
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
