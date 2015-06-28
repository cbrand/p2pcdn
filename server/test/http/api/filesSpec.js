var request = require('supertest');
var HttpStatus = require('http-status-codes');
var should = require('should');
var helpers = require('../../helpers');
var apiHelpers = require('./helpers');

var server = helpers.require('http/server');
var Config = helpers.require('config');

describe('http', function() {
    var app;

    beforeEach(function() {
        return apiHelpers.setUp().then(function(data) {
            app = data.app;
        });
    });

    afterEach(function() {
        return apiHelpers.tearDown();
    });

    describe('/api/files/:uuid', function() {
        var fileHandler;
        var addedUUID;
        var model;

        beforeEach(function() {
            fileHandler = server.app.get('fileHandler');

            var stream = helpers.readableStream("Random blob data");
            return fileHandler.add('data.blob', stream).then(function(addedModel) {
                model = addedModel;
                addedUUID = addedModel.uuid;
            });
        });

        describe('GET', function() {
            it('should return the correct data', function(done) {
                request(app)
                    .get('/api/files/' + addedUUID)
                    .set('Accept', 'application/json')
                    .end(function(err, res) {
                        should(err).be.null;

                        var json = res.body;
                        json.uuid.should.equal(addedUUID);
                        json.fileName.should.equal(model.fileName);
                        json.mediaType.should.equal(model.mediaType);
                        json.chunks.should.equal(model.numChunks);

                        done();
                    });
            });

            it('should return not found if the uuid is not stored', function(done) {
                request(app)
                    .get('/api/files/' + addedUUID + 'doesnotexist')
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.NOT_FOUND)
                    .end(function(err) {
                        should(err).be.null;
                        done();
                    });
            });
        });

        describe('/download', function() {
            var getDownload = function(uuid) {
                return request(app)
                    .get('/api/files/' + (uuid || addedUUID) + '/download');
            };

            it('should set the correct headers', function(done) {
                getDownload()
                    .expect(HttpStatus.OK)
                    .end(function(err, res) {
                        should(err).be.null;

                        res.header['content-type'].should.equal('application/octet-stream');
                        res.header['content-disposition'].should.equal('attachment; filename="data.blob"');

                        done();
                    });

            });

            it('should return not found if the uuid is not stored', function(done) {
                getDownload(addedUUID + 'doesnotexist')
                    .expect(HttpStatus.NOT_FOUND)
                    .end(function(err) {
                        should(err).be.null;
                        done();
                    });
            });
        });

        describe('/chunks/:chunk', function() {

            var chunkURL = function(chunk) {
                return '/api/files/' + addedUUID + '/chunks/' + chunk;
            };

            describe('GET', function() {

                it('should return the correct chunk information', function(done) {
                    request(app)
                        .get(chunkURL(0))
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.OK)
                        .end(function(err, res) {
                            should(err).be.null;

                            var json = res.body;

                            model.chunkID(0).then(function(expectedChunkID) {
                                json.uuid.should.equal(expectedChunkID);
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
                            should(err).be.null;
                            done();
                        });
                });

                it('should return a not found if a chunk with a index over the available one is given', function(done) {
                    request(app)
                        .get(chunkURL(model.numChunks))
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.NOT_FOUND)
                        .end(function(err) {
                            should(err).be.null;
                            done();
                        });
                });

                it('should return a bad request if a chunk which can\'t be converted into a number is given', function(done) {
                    request(app)
                        .get(chunkURL("NO_NUMBER"))
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.BAD_REQUEST)
                        .end(function(err) {
                            should(err).be.null;
                            done();
                        });
                });

            });

            describe('/download', function() {
                describe('GET', function() {
                    var getDownload = function(chunk) {
                        return request(app)
                            .get(chunkURL(chunk) + '/download');
                    };

                    it('should set the correct headers', function(done) {
                        getDownload(0)
                            .expect(HttpStatus.OK)
                            .end(function(err, res) {
                                should(err).be.null;

                                res.header['content-type'].should.equal('application/octet-stream');

                                done();
                            });

                    });

                    it('should return not found if the chunk id is too high', function(done) {
                        getDownload(model.numChunks)
                            .expect(HttpStatus.NOT_FOUND)
                            .end(function(err) {
                                should(err).be.null;
                                done();
                            });
                    });
                })
            });

        });

    });

});
