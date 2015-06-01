var path = require('path');
var temp = require('temp');

var DatabaseConfig = require('../dist/config/database');
var db = require('../dist/db');

describe('database', function() {

    var directory;
    var config;
    beforeEach(function() {
        temp.track();

        directory = temp.mkdirSync();
        config = new DatabaseConfig({
            type: 'sqlite',
            path: path.join(directory, 'p2pcdn.db')
        });
    });

    afterEach(function() {
        temp.cleanupSync();
    });

    it('should be able to initialize the database', function() {
        db.init(config);
        return db.sync();
    });

});
