var fs = require('fs');
var helpers = require('../helpers');
var File = helpers.require('data/file.js');
var constants = helpers.require('constants.js');
var temp = require('temp');
var mockery = require('mockery');
var crypto = require('crypto');

require('should');

describe('File', function () {
    var testDir;

    beforeEach(function (cb) {
        temp.track();
        testDir = temp.mkdir('filetest', function (err, dirPath) {
            testDir = dirPath;
            if (err) {
                cb(err);
            }
            cb();
        });
    });

    afterEach(function (cb) {
        temp.cleanup(cb);
    });

    it('should throw an error if the constructor is initialized without new', function () {
        (function () {
            File(testDir);
        }).should.throw();
    });

    describe('when no file is present', function () {
        var f;
        var fName;

        beforeEach(function () {
            fName = testDir + '/client.txt';
            f = new File(fName);
        });


        it('should throw an error', function () {
            (function () {
                return f.numChunks;
            }).should.throw();
        });
    });

    describe('when a directory is set to the file path', function () {
        var f;

        beforeEach(function () {
            f = new File(testDir);
        });

        it('should throw an error if a directory exists on the given file location', function () {
            (function () {
                return f.numChunks;
            }).should.throw();
        });

    });

    describe('when file is present', function () {
        var f;
        var fName;
        var chunks;
        var createChunk = function (character, chunkSize) {
            chunkSize = chunkSize || constants.CHUNK_SIZE;
            var chunk = '';
            for (var chunkIndex = 0; chunkIndex < chunkSize; chunkIndex++) {
                chunk += String(character);
            }
            return chunk;
        };

        beforeEach(function () {
            fName = testDir + '/client.txt';
            chunks = [];

            for (var i = 0; i < 10; i++) {
                chunks.push(createChunk(i));
            }

            fs.writeFileSync(fName, chunks.join(''));
            f = new File(fName);
        });

        describe('numChunks', function () {

            it('should return the correct number of chunks', function () {
                f.numChunks.should.equal(10);
            });

            it('should return the correct number of chunks when uneven', function () {
                chunks = [];
                chunks.push(createChunk('a'));
                chunks.push(createChunk('b', constants.CHUNK_SIZE - 2));

                fs.writeFileSync(fName, chunks.join(''));
                f.numChunks.should.equal(2);
            });

        });

        describe('chunks', function () {

            it('should throw an error if a too high chunk number is passed', function () {
                (function () {
                    f.chunk(11);
                }).should.throw();
            });

            it('should throw an error if negative chunk number is passed', function () {
                (function () {
                    f.chunk(-1);
                }).should.throw();
            });

            it('should return the correct chunk', function () {
                return f.chunk(1).then(function (data) {
                    data.should.equal(createChunk('1'));
                });
            });

            it('should return data who does not align to chunk sizes', function () {
                chunks = [];
                chunks.push(createChunk('a'));
                chunks.push(createChunk('b', constants.CHUNK_SIZE - 2));

                fs.writeFileSync(fName, chunks.join(''));

                return f.chunk(1).then(function (data) {
                    data.should.equal(createChunk('b', constants.CHUNK_SIZE - 2));
                });
            });


            describe('on read stream error', function () {
                var events;
                beforeEach(function () {
                    mockery.enable();

                    events = {};
                    var fsMock = {
                        createReadStream: function () {
                            return {
                                on: function (name, func) {
                                    events[name] = events[name] || [];
                                    events[name].push(func);
                                }
                            };
                        },
                        statSync: function () {
                            return {
                                size: constants.CHUNK_SIZE * 10,
                                isFile: function () {
                                    return true;
                                }
                            };
                        }
                    };
                    mockery.registerMock('fs', fsMock);
                    f = new File('test.txt');
                });

                afterEach(function () {
                    mockery.deregisterAll();
                    mockery.disable();
                });

                it('should notify with an error', function () {
                    f.chunk(0).then(function () {
                        throw new Error('Should not be called');
                    }, function (err) {
                        err.toString().should.equal('Error: Internal error');
                    });

                    events.error.forEach(function (func) {
                        func(new Error('Internal error'));
                    });
                });
            });

        });

        describe('chunkID', function () {

            var shaHash = function (char, size) {
                char = char || '0';
                size = size || constants.CHUNK_SIZE;

                var sha256 = crypto.createHash('sha256');
                for (var i = 0; i < size; i++) {
                    sha256.update(char);
                }
                return sha256.digest('hex');
            };

            it('should return the correct hash when requesting the chunk ID', function () {
                var expectedHash = shaHash();
                return f.chunkID(0).then(function (hash) {
                    hash.should.equal(expectedHash);
                });
            });

        });

        describe('stream', function () {

            it('should accept to paas no arguments', function (done) {
                var stream = f.stream();
                var data = '';
                stream.on('data', function (d) {
                    data += d;
                });
                stream.on('end', function () {
                    data.length.should.be.above(0);
                    done();
                });
            });

        });
    });

});
