
class Handler {
    /**
     * @param {App} app
     * @param {Request} request
     */
    constructor(app, request) {
        this.app = app;
        this.request = request;
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
     * @returns {Promise.<Response>}
     */
    handle() {
        return null;
    }
}

export default Handler;
