/**
 * Global app class which holds the necessary state
 * for a application of the cdn network on the server
 * side.
 */

var events = require('events');
var db = require('./db');
var FileHandler = require('./handlers/file');
var Orchestrator = require('./channelOrchestrator/orchestrator');


class App extends events.EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.db = db.db;
        this.fileHandler = new FileHandler(config);
        this.orchestrator = new Orchestrator(this);
    }

}

export default App;
