var fs = require('fs');
var path = require('path');
var temp = require('temp');
var stream = require('stream');

var helpers = require('../helpers');

var Config = helpers.require('config');
var db = helpers.require('db');
var FileHandler = helpers.require('handlers/file');


describe ('FileHandler', function() {
    var directory;
    var fileDirectory;
    var config;

    beforeEach(function(cb) {
        temp.track();

        directory = temp.mkdirSync();
        fileDirectory = path.join(directory, 'files');
        fs.mkdirSync(fileDirectory);

        config = new Config();
        config.config = {
            fileDirectory: fileDirectory,
            database: {
                type: 'sqlite',
                path: path.join(directory, 'p2pcdn.db')
            }
        };

        db.init(config.database);
        db.sync().then(cb);
    });

    afterEach(function() {
        temp.cleanupSync();
    });

    it('should be able to add a file', function(done) {
        var s = new stream.Readable();
        s._read = function noop() {};

        var fileHandler = new FileHandler(config);
        fileHandler.add('test.txt', s, {}).then(function(uuid) {
            expect(uuid).not.toBeFalsy();
            done();
        });

        s.push('Testfile');
        s.push('More stuff');
        s.push(null);
    }, 250);

});
