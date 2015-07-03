/**
 * Global app class which holds the necessary state
 * for a application of the cdn network on the server
 * side.
 */

var events = require('events');
var db = require('./db');
var FileHandler = require('./handlers/file');

class App extends events.EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.db = db.db;
        this.fileHandler = new FileHandler(config);
    }

}

export default App;
