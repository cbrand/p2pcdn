var helpers = require('../../helpers');
var dbHelpers = require('../../db/helpers');
var expect = helpers.chai.expect;
var File = require('db/file');
var messages = require('messages/message');
var FileInfoHandler = require('rtc/channel_handlers/file_info');
var ErrorResponse = messages.Error;
var ErrorCode = ErrorResponse.Code;


describe('rtc', function() {
    describe('channelHandlers', function() {

        describe('FileInfo', function() {

            beforeEach(function() {
                return dbHelpers.truncate();
            });

            var infoFor = function(id) {
                return new messages.GetFileInfo(id);
            };
            var handlerFor = function(id) {
                return new FileInfoHandler(infoFor(id));
            };

            it('should support GetFileInfo requests', function() {
                return expect(handlerFor('does-not-matter').supports()).to.be.true;
            });

            it('should not support non GetFileInfo requests', function() {
                return expect(new FileInfoHandler(new ErrorResponse()).supports()).to.be.false;
            });

            describe('when requesting non existing files', function() {
                var promise;
                beforeEach(function() {
                    promise = handlerFor('does-not-exist').handle();
                });

                it('should fail', function() {
                   return expect(promise).to.be.rejected;
                });

                it('should set the correct error message and type', function() {
                    return promise.catch(function(err) {
                        expect(err).to.be.an.instanceof(ErrorResponse);
                        expect(err.code).to.equal(ErrorCode.UUID_NOT_FOUND);
                    });
                });
            });

            describe('when files are stored', function() {
                var storedFile;
                var promise;

                beforeEach(function() {
                    return File.loadOrCreate('this-exists').then(function(file) {
                        file.name = 'hello-world.txt';
                        file.mimeType = 'plain/text';
                        file.numChunks = 5;
                        storedFile = file;
                        return file.save();
                    });
                });


                it('should return the correct file name', function() {
                    promise = handlerFor(storedFile.id).handle();
                    return expect(promise).to.eventually.have.property('name', storedFile.name);
                });

                it('should return the correct mime type', function() {
                    promise = handlerFor(storedFile.id).handle();
                    expect(promise).to.eventually.have.property('mimeType', storedFile.mimeType);
                });

                it('should return the correct number of chunks', function() {
                    promise = handlerFor(storedFile.id).handle();
                    expect(promise).to.eventually.have.property('numChunks', storedFile.numChunks);
                });

                it('should report the correct amount of chunks which the client does not have yet', function() {
                    promise = handlerFor(storedFile.id).handle().then(function(data) {
                        return data.missingChunks.sort();
                    });
                    expect(promise).to.eventually.equal([0, 1, 2, 3, 4]);
                });

                describe('and chunks exist', function() {
                    var chunks = dbHelpers.createBase64Chunks([
                        'a', 'b', 'c', 'd', 'e'
                    ]);
                    var missingChunkNums = [2, 3].sort();

                    beforeEach(function() {
                        return dbHelpers.fillChunksExcept(storedFile, chunks, missingChunkNums);
                    });

                    it('should correctly report the correct chunks', function() {
                        promise = handlerFor(storedFile.id).handle().then(function(data) {
                            return data.missingChunks.sort();
                        });
                        expect(promise).to.eventually.equal(missingChunkNums);
                    });

                });

            });


        });
    });
});
