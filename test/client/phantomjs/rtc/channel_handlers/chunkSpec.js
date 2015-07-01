var helpers = require('../../helpers');
var expect = helpers.chai.expect;
var dbHelpers = require('../../db/helpers');
var File = require('db/file');
var ChunkHandler = require('rtc/channel_handlers/chunk');
var messages = require('messages/message');
var ErrorResponse = messages.Error;
var ErrorCode = ErrorResponse.Code;


describe('rtc', function () {
    describe('channelHandlers', function () {

        describe('Chunk', function () {

            beforeEach(function () {
                return dbHelpers.truncate();
            });

            var chunkFor = function (id, chunk) {
                return new messages.GetChunk(id, chunk);
            };
            var handlerFor = function (id, chunk) {
                return new ChunkHandler(chunkFor(id, chunk));
            };

            it('should support GetFileInfo requests', function () {
                return expect(handlerFor('does-not-matter', 0).supports()).to.be.true;
            });

            it('should not support non GetChunk requests', function () {
                return expect(new ChunkHandler(new ErrorResponse()).supports()).to.be.false;
            });

            describe('when requesting non existing files', function () {
                var promise;
                beforeEach(function () {
                    promise = handlerFor('does-not-exist').handle();
                });

                it('should fail', function () {
                    return expect(promise).to.be.rejected;
                });

                it('should set the correct error message and type', function () {
                    return promise.catch(function (err) {
                        expect(err).to.be.an.instanceof(ErrorResponse);
                        expect(err.code).to.equal(ErrorCode.UUID_NOT_FOUND);
                    });
                });
            });

            describe('when files are stored', function () {
                var storedFile;
                var promise;

                beforeEach(function () {
                    return File.loadOrCreate('this-exists').then(function (file) {
                        file.name = 'hello-world.txt';
                        file.mimeType = 'plain/text';
                        file.numChunks = 5;
                        storedFile = file;
                        return file.save();
                    });
                });

                describe('when requesting non existing chunks', function () {

                    beforeEach(function () {
                        promise = handlerFor(storedFile.id, 1).handle();
                    });

                    it('should reject the request', function () {
                        return expect(promise).to.be.rejected;
                    });

                    it('should return the CHUNK_NOT_FOUND error code', function () {
                        return promise.catch(function (err) {
                            expect(err.code).to.equal(ErrorCode.CHUNK_NOT_FOUND);
                        });
                    });

                });

                describe('when requesting chunks out of the boundary', function () {

                    beforeEach(function () {
                        promise = handlerFor(storedFile.id, 5).handle();
                    });

                    it('should reject the request', function () {
                        return expect(promise).to.be.rejected;
                    });

                    it('should return the CHUNK_OUT_OF_BOUNDS error code', function () {
                        return promise.catch(function (err) {
                            expect(err.code).to.equal(ErrorCode.CHUNK_OUT_OF_BOUNDS);
                        });
                    });

                });

                describe('and chunks exist', function () {
                    var chunks = dbHelpers.createBase64Chunks([
                        'a', 'b', 'c', 'd', 'e'
                    ]);
                    var missingChunkNums = [2, 3, 4].sort();

                    beforeEach(function () {
                        return dbHelpers.fillChunksExcept(storedFile, chunks, missingChunkNums);
                    });

                    it('should correctly report the correct chunk', function () {
                        promise = handlerFor(storedFile.id, 1).handle();

                        return expect(promise.then(function (chunk) {
                            return helpers.blobToBase64(chunk.data);
                        })).to.eventually.equal(chunks[1]);
                    });

                });

            });

        });
    });
});
