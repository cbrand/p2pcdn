var events = require('events');

/**
 * Base orchestrator.
 */
class BaseOrchestrator extends events.EventEmitter {

    constructor(parentOrchestrator) {
        super();
        var self = this;
        self.parentOrchestrator = parentOrchestrator;
    }

    get app() {
        return this.parentOrchestrator.app;
    }

}

export default BaseOrchestrator;
