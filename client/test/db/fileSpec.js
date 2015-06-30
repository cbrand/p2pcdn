var Q = require('q');
var helpers = require('../helpers');
helpers.emulateBrowser();
var expect = helpers.chai.expect;

var File = helpers.require('db/file');
var db = helpers.require('db/persistence/common');


describe('DB', function () {
    describe('File', function () {
        var getTestFile = function () {
            var file = new File('first-file');
            file.name = 'testFile.mp4';
            file.mimeType = 'video/mp4';
            file.numChunks = 5;
            return file;
        };

        beforeEach(function () {
            return db.truncate();
        });

        it('should correctly default numChunks to 0', function() {
            expect(new File('second-file').numChunks).to.equal(0);
        });

        describe('fetch', function () {
            it('should be able to create a new file if none has been stored yet', function () {
                return File.loadOrCreate('does-not-exist-yet').then(function (file) {
                    expect(file.id).to.equal('does-not-exist-yet');
                });
            });

            it('should return an error if the file does not exist and is requested through the "load" function', function () {
                return expect(File.load('does-not-exist')).to.be.rejected;
            });

            describe('when saved', function () {
                var usedID;
                var loadedFile;

                beforeEach(function () {
                    return getTestFile().save().then(function (file) {
                        usedID = file.id;
                    }).then(function () {
                        return File.loadOrCreate(usedID);
                    }).then(function (file) {
                        loadedFile = file;
                    });
                });

                it('should correctly store the name', function () {
                    expect(loadedFile.name).to.equal('testFile.mp4');
                });

                it('should correctly store the mime type', function () {
                    expect(loadedFile.mimeType).to.equal('video/mp4');
                });

                it('should correctly store the number of chunks', function () {
                    expect(loadedFile.numChunks).to.equal(5);
                });
            });
        });

        describe('save', function () {
            it('should be able to save a file', function () {
                var file = new File("will-exist");
                return file.save();
            });
        });

        describe('delete', function () {
            var savedFile;
            beforeEach(function () {
                return getTestFile().save().then(function (file) {
                    savedFile = file;
                });
            });

            it('should be able to delete a file', function () {
                return savedFile.remove().then(function () {
                    return expect(File.load(savedFile.id)).to.be.rejected;
                });
            });

            it('should be able to remove a file which has not been removed from the database as of now', function() {
                var tempFileHandle = new File(savedFile.id);
                return tempFileHandle.remove().then(function() {
                    return expect(File.load(savedFile.id)).to.be.rejected;
                });
            });

            it('should not have an issue to remove already removed files', function() {
                var tempFileHandle = new File(savedFile.id+'a');
                return expect(tempFileHandle.remove()).to.be.fulfilled;
            });
        });

        describe('chunks', function () {
            var savedFile;
            beforeEach(function () {
                return getTestFile().save().then(function (file) {
                    savedFile = file;
                });
            });
            var chunks = [
                "first chunk",
                "second chunk",
                "third chunk",
                "fourth chunk",
                "fifth chunk"
            ].map(function (chunk) {
                    return new Buffer(chunk).toString('base64')
                });

            describe('hasChunk', function () {

                it('should deny that it has stored a chunk up to now', function () {
                    return expect(savedFile.hasChunk(0)).to.eventually.equal(false);
                });

                context('when chunks exist', function () {
                    beforeEach(function () {
                        var promise = Q();
                        for (var i = 0; i < 5; i++) {
                            if (i !== 2) {
                                (function (numChunk) {
                                    promise = promise.then(function () {
                                        return savedFile.setChunk(numChunk, chunks[numChunk]);
                                    });
                                })(i)
                            }
                        }
                        return promise;
                    });

                    it('should deny that non stored files are stored', function () {
                        return expect(savedFile.hasChunk(2)).to.eventually.equal(false);
                    });

                    it('should positively return that stored chunks are existing', function () {
                        return expect(savedFile.hasChunk(1)).to.eventually.equal(true);
                    });

                });

            });

            describe('set', function() {
                var chunk = chunks[0];

                it('should be able to store a chunk', function() {
                    return expect(savedFile.setChunk(0, chunk)).to.be.fulfilled;
                });

                it('should store the correct data', function() {
                    var promise = savedFile.setChunk(0, chunk).then(function() {
                        return savedFile.getChunk(0);
                    });
                    return expect(promise.then(function(data) {
                        return data.toString('base64');
                    })).to.eventually.equal(chunk);
                });

            });

            describe('remove', function() {
                var chunk = chunks[0];

                it('should return an error, if no chunk is existing', function() {
                    return expect(savedFile.removeChunk(0)).to.be.rejected;
                });

                it('should remove a stored chunk', function() {
                    var promise = savedFile.setChunk(0, chunk).then(function() {
                        return savedFile.removeChunk(0);
                    }).then(function() {
                        return savedFile.hasChunk(0);
                    });
                    return expect(promise).to.eventually.equal(false);
                });

            });
        });

    });
});
