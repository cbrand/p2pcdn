var fs = require('fs');
var path = require('path');
var temp = require('temp');
var Q = require('q');

var helpers = require('../helpers');
var expect = helpers.chai.expect;

var Config = helpers.require('config');
var db = helpers.require('db');
var FileHandler = helpers.require('handlers/file');


describe('FileHandler', function () {
    var directory;
    var fileDirectory;
    var config;

    beforeEach(function () {
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
        return db.sync();
    });

    afterEach(function () {
        temp.cleanupSync();
    });

    var sendReadableStream = helpers.readableStream;

    var addData = function (options, stream) {
        options = options || {};
        var fileHandler = new FileHandler(config);
        stream = stream || sendReadableStream('Testfile', 'More stuff', 'And much more stuff');
        return fileHandler.add(options.fileName || 'test2.txt', stream, options);
    };

    describe('add', function () {
        it('should be able to add a file', function () {
            var fileHandler = new FileHandler(config);
            var stream = sendReadableStream('Testfile', 'More stuff');
            return fileHandler.add('test.txt', stream, null).then(function (obj) {
                expect(obj).to.be.ok;
            });
        });

        it('should return a uuid.', function () {
            return addData().then(function (obj) {
                expect(obj.uuid).to.be.ok;
            });
        });

        it('should return the correct filename', function () {
            return addData({ fileName: 'test.txt' }).then(function (obj) {
                expect(obj.fileName).to.equal('test.txt');
            });
        });

        it('should automatically set the correct mimetype (for text)', function () {
            return addData({ fileName: 'test.txt' }).then(function (obj) {
                expect(obj.mimeType).to.equal('text/plain');
            });
        });

        it('should automatically set the correct mimetype (for pdf)', function () {
            return addData({ fileName: 'test.pdf' }).then(function (obj) {
                expect(obj.mimeType).to.equal('application/pdf');
            });
        });

        it('should be able to manually overwrite the mimetype', function () {
            return addData({ fileName: 'test.pdf', mimeType: 'text/plain' }).then(function (obj) {
                expect(obj.mimeType).to.equal('text/plain');
            });
        });

        it('should create a file', function () {
            return addData({ fileName: 'test.pdf', mimeType: 'text/plain' }).then(function (obj) {
                var uuidPath = path.join(fileDirectory, obj.uuid);
                fs.exists(uuidPath, function (exists) {
                    expect(exists).to.equal(true);
                });
            });
        });

        it('should have the correct file contents', function (done) {
            addData({ fileName: 'test.pdf', mimeType: 'text/plain' }).then(function (obj) {
                var uuidPath = path.join(fileDirectory, obj.uuid);
                fs.readFile(uuidPath, { encoding: 'utf-8' }, function (_, data) {
                    expect(data).to.equal('TestfileMore stuffAnd much more stuff');
                    done();
                });
            });
        });

        it('should support to set multiple files at once', function () {
            return Q.all([
                addData({ fileName: 'test.txt' }, sendReadableStream('test', '123')),
                addData({ fileName: 'test.txt' }, sendReadableStream('test', '456'))
            ]).then(function (data) {
                expect(data[0].fileName).to.equal('test.txt');
                expect(data[1].fileName).to.equal('test.txt');
                expect(data[0].uuid).to.not.equal(data[1].uuid);
            });
        });
    });

    var mangleUUID = function (uuid) {
        var char = 'b';
        if (uuid.charAt(uuid.length - 1) === 'b') {
            char = 'a';
        }
        return uuid.slice(0, uuid.length - 1) + char;
    };

    describe('has', function () {
        var addedUUID;
        var fileHandler;
        var wrapperFile;

        beforeEach(function () {
            fileHandler = new FileHandler(config);
            return addData({ fileName: 'test.pdf' }, sendReadableStream('Hello world')).then(function (model) {
                wrapperFile = model;
                addedUUID = model.uuid;
            });
        });

        it('should return true if the uuid exists', function () {
            return fileHandler.has(addedUUID).then(function (hasUUID) {
                expect(hasUUID).to.be.ok;
            });
        });

        it('should return false if the uuid does not exist', function () {
            return fileHandler.has(mangleUUID(addedUUID)).then(function (hasUUID) {
                expect(hasUUID).to.not.be.ok;
            });
        });

        it('should return false if the uuid has been removed', function () {
            return wrapperFile.dbFile.destroy().then(function () {
                return fileHandler.has(addedUUID);
            }).then(function (hasUUID) {
                expect(hasUUID).to.not.be.ok;
            });
        });

        it('should return false if the file has been deleted', function () {
            var pathToUUID = path.join(fileDirectory, addedUUID);
            fs.unlinkSync(pathToUUID);
            return fileHandler.has(addedUUID)
                .then(function (hasUUID) {
                    expect(hasUUID).to.not.be.ok;
                });
        });

    });

    describe('get', function () {
        var addedUUID;
        var fileHandler;

        beforeEach(function () {
            fileHandler = new FileHandler(config);
            return addData({ fileName: 'test.pdf' }, sendReadableStream('Hello world'))
                .then(function (model) {
                    addedUUID = model.uuid;
                });
        });

        it('should return the file', function () {
            return fileHandler.get(addedUUID).then(function (model) {
                expect(model.uuid).to.equal(addedUUID);
            });
        });

        it('should return an error if the file could not be found', function () {
            return fileHandler.get(mangleUUID(addedUUID)).catch(function (err) {
                expect(err).to.be.ok;
            });
        });
    });

});
