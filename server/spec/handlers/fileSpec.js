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

    var sendReadableStream = function() {
        var s = new stream.Readable();
        s._read = function noop() {};
        var args = arguments;
        setImmediate(function() {
            for(var argument in args) {
                s.push(argument);
            }
            s.push(null);
        });
        return s;
    };

    it('should be able to add a file', function(done) {
        var fileHandler = new FileHandler(config);
        var stream = sendReadableStream('Testfile', 'More stuff');
        fileHandler.add('test.txt', stream, null).then(function(obj) {
            expect(obj).not.toBeFalsy();
            done();
        });
    });

    var addData = function(options) {
        options = options || {};
        var fileHandler = new FileHandler(config);
        var stream = sendReadableStream('Testfile', 'More stuff', 'And much more stuff');
        return fileHandler.add(options.fileName || 'test2.txt', stream, options);
    };

    it('should return a uuid.', function(done) {
        addData().then(function(obj) {
            expect(obj.uuid).toBeTruthy();
        }).then(done);
    });

    it('should return the correct filename', function(done) {
        addData({fileName: 'test.txt'}).then(function(obj) {
            expect(obj.fileName).toEqual('test.txt');
        }).then(done);
    });

    it('should automatically set the correct mimetype (for text)', function(done) {
        addData({fileName: 'test.txt'}).then(function(obj) {
            expect(obj.mimeType).toEqual('text/plain');
        }).then(done);
    });

    it('should automatically set the correct mimetype (for pdf)', function(done) {
        addData({fileName: 'test.pdf'}).then(function(obj) {
            expect(obj.mimeType).toEqual('application/pdf');
        }).then(done);
    });

    it('should be able to manually overwrite the mimetype', function(done) {
        addData({fileName: 'test.pdf', mimeType: 'text/plain'}).then(function(obj) {
            expect(obj.mimeType).toEqual('text/plain');
        }).then(done);
    });

    it('should create a file', function(done) {
        addData({fileName: 'test.pdf', mimeType: 'text/plain'}).then(function(obj) {
            var uuidPath = path.join(fileDirectory, obj.uuid);
            fs.exists(uuidPath, function(exists) {
                expect(exists).toBeTruthy();
            });
        }).then(done);
    });

    it('should have the correct file contents', function(done) {
        addData({fileName: 'test.pdf', mimeType: 'text/plain'}).then(function(obj) {
            var uuidPath = path.join(fileDirectory, obj.uuid);
            fs.readFile(uuidPath, function(data) {
                expect(data).toEqual('TestfileMore StuffAnd much more stuff');
            });
        }).then(done);
    });

});
