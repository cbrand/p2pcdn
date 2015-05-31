/**
 * Object to get and load the configuration data of the given entry.
 */

var fs = require('fs');
var ini = require('ini');
var Database = require('./config/database');

class Config {
    /**
     * @param {String} configPath The path to the configuration file.
     */
    constructor(configPath) {
        this.configPath = configPath;
        this.config = {};
    }

    /**
     * Load parses the configuration path and updates the configuration
     * parameters in this entry.
     */
    load() {
        var data = fs.readFileSync(this.configPath, {
            encoding: 'utf-8'
        });
        this.config = ini.parse(data);
    }

    get database() {
        return new Database(this.config.database);
    }

    /**
     * Returns the directory files should be stored to for download
     * purposes.
     */
    get fileDirectory() {
        return this.config.fileDirectory || null;
    }
}

export default Config;
