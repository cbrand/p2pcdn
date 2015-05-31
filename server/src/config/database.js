/**
 * Functionality to parse database configuration data from
 * the config values.
 */

var stringOrNull = function(value) {
    if (typeof value == 'string') {
        return value;
    }
    return null;
};


class Database {
    constructor(databaseConfig) {
        this.databaseConfig = databaseConfig  || {};
    }

    _stringIfNetworkDb(value, defaultValue) {
        if (this._isNetworkDB) {
            var res = stringOrNull(value);
            if(res === null) {
                res = defaultValue || null;
            }
            return res;
        }
        return null;
    }

    /**
     * Returns if this is a database usually connected
     * over the network.
     *
     * @returns {boolean}
     * @private
     */
    get _isNetworkDB() {
        return this.type == 'mysql';
    }

    /**
     * Returns the user of the database if this is necessary for
     * the database configuration. Returns null otherwise.
     *
     * @returns {string|null}
     */
    get user() {
        return this._stringIfNetworkDb(this.databaseConfig.user);
    }

    /**
     * Returns the password of the database if this is necessary for
     * the database configuration. Returns null otherwise.
     *
     * @returns {string|null}
     */
    get password() {
        return this._stringIfNetworkDb(this.databaseConfig.password);
    }

    /**
     * Returns the host of the database if this is necessary for the
     * database configuration. Returns null otherweise.
     *
     * @returns {string|null}
     */
    get host() {
        return this._stringIfNetworkDb(this.databaseConfig.host);
    }

    /**
     * Returns the port of the database if this is necessary for the
     * database configuration. Returns null otherwise.
     *
     * @returns {}
     */
    get port() {
        if (!this._isNetworkDB) {
           return null;
        }

        var port = Number(this.databaseConfig.port);

        if(!port) {
            if(this.type == 'mysql') {
                return 3306;
            }
            return 0;
        }
        return port;
    }

    /**
     * Returns the type of the database.
     * Currently supported are 'sqlite' and 'mysql'.
     *
     * @returns {string}
     */
    get type() {
        var databaseType = (this.databaseConfig.type || 'sqlite').toLowerCase();
        if (databaseType != 'sqlite' && databaseType != 'mysql') {
            databaseType = 'sqlite';
        }
        return databaseType;
    }

    /**
     * Returns the path to a sqlite database. Returns null, if the database type
     * is not sqlite.
     *
     * @returns {string|null}
     */
    get path() {
        var database = this.databaseConfig;
        var databaseType = this.type;
        if (databaseType == 'sqlite') {
            if (typeof database.path !== 'string') {
                return 'p2p-cdn.db'
            }
            return database.path;
        }
        return null;
    }
}

export default Database;
