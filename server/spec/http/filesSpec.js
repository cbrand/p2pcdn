var fs = require('fs');
var path = require('path');
var http = require('http');
var temp = require('temp');
var request = require('supertest');
var bodyParser = require('body-parser');
var HttpStatus = require('http-status-codes');
var helpers = require('../helpers');

var server = helpers.require('http/server');
var Config = helpers.require('config');
var db = helpers.require('db');

describe('http', function() {
    var directory;
    var fileDirectory;
    var config;
    var app;

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

        server.init(config);
        db.init(config.database);
        db.sync().then(cb);

        app = server.app;
    });

    afterEach(function() {
        temp.cleanupSync();
    });

    describe('/api/files/:uuid', function() {
        var fileHandler;
        var addedUUID;
        var model;

        beforeEach(function(done) {
            fileHandler = server.app.get('fileHandler');

            var stream = helpers.readableStream("Random blob data");
            fileHandler.add('data.blob', stream).then(function(addedModel) {
                model = addedModel;
                addedUUID = addedModel.uuid;
            }).then(done);
        });

        describe('GET', function() {
            it('should return the correct data', function(done) {
                request(app)
                    .get('/api/files/' + addedUUID)
                    .set('Accept', 'application/json')
                    .end(function(err, res) {
                        expect(err).toBeNull();

                        var json = res.body;
                        expect(json.uuid).toEqual(addedUUID);
                        expect(json.fileName).toEqual(model.fileName);
                        expect(json.mediaType).toEqual(model.mediaType);
                        expect(json.chunks).toEqual(model.numChunks);

                        done();
                    });
            });

            it('should return not found if the uuid is not stored', function(done) {
                request(app)
                    .get('/api/files/' + addedUUID + 'doesnotexist')
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.NOT_FOUND)
                    .end(function(err) {
                        expect(err).toBeNull();
                        done();
                    });
            });
        });

        describe('/chunks/:chunk', function() {

            var chunkURL = function(chunk) {
                return '/api/files/' + addedUUID + '/chunks/' + chunk;
            };

            it('should return the correct chunk information', function(done) {
                request(app)
                    .get(chunkURL(0))
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.OK)
                    .end(function(err, res) {
                        expect(err).toBeNull();

                        var json = res.body;

                        model.chunkID(0).then(function(expectedChunkID) {
                            expect(json.uuid).toEqual(expectedChunkID);
                            done();
                        });
                    });
            });

            it('should return a not found if a chunk with a index under 0 is given', function(done) {
                request(app)
                    .get(chunkURL(-1))
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.NOT_FOUND)
                    .end(function(err) {
                        expect(err).toBeNull();
                        done();
                    });
            });

            it('should return a not found if a chunk with a index over the available one is given', function(done) {
                request(app)
                    .get(chunkURL(model.numChunks))
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.NOT_FOUND)
                    .end(function(err) {
                        expect(err).toBeNull();
                        done();
                    });
            });

            it('should return a bad request if a chunk which can\'t be converted into a number is given', function(done) {
                request(app)
                    .get(chunkURL("NO_NUMBER"))
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.BAD_REQUEST)
                    .end(function(err) {
                        expect(err).toBeNull();
                        done();
                    });
            });
        });

    });

});
