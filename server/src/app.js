/**
 * Global app class which holds the necessary state
 * for a application of the cdn network on the server
 * side.
 */

var db = require('./db');
var FileHandler = require('./handlers/file');

class App {

    constructor(config) {
        this.config = config;
        this.db = db.db;
        this.fileHandler = new FileHandler(config);
    }

}

export default App;
