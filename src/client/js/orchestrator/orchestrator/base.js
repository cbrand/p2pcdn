var events = require('events');

class BaseOrchestrator extends events.EventEmitter {

    constructor(parentOrchestrator) {
        super();
        this.parentOrchestrator = parentOrchestrator;
    }

    get serverRtcChannel() {
        return this.parentOrchestrator.serverRtcChannel;
    }

    get baseChannel() {
        return this.serverRtcChannel.channel;
    }

    get app() {
        return this.parentOrchestrator.app;
    }

    _initOrchestrator(orchestratorClass) {
        var self = this;
        return new orchestratorClass(
            self.parentOrchestrator
        );
    }
}

export default BaseOrchestrator;
