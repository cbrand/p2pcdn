
var fs = require('fs'),
    file = require('../../dist/data/file.js'),
    constants = require('../../dist/constants.js'),
    temp = require('temp')
;

describe('file.File', function() {
    var testDir;

    beforeEach(function(cb) {
        temp.track();
        testDir = temp.mkdir('filetest', function(err, dirPath) {
            testDir = dirPath;
            if(err) {
                cb(err);
            }
            cb();
        });
    });

    afterEach(function(cb) {
        temp.cleanup(cb);
    });

    describe('when no file is present', function() {
        var f,
            fName;

        beforeEach(function () {
            fName = testDir + '/test.txt';
            f = new file.File(fName);
        });


        it('should throw an error', function () {
            expect(function () {
                f.numChunks
            }).toThrowError(Error);
        });
    });

    describe('when a directory is set to the file path', function() {
        var f;

        beforeEach(function() {
            f = new file.File(testDir);
        });

        it('should throw an error if a directory exists on the given file location', function() {
            expect(function() {f.numChunks}).toThrowError(Error);
        });

    });

    describe('when file is present', function() {
        var f,
            fName,
            chunks,
            createChunk = function(character, chunkSize) {
                chunkSize = chunkSize || constants.CHUNK_SIZE;
                var chunk = "";
                for(var chunkIndex = 0; chunkIndex < chunkSize; chunkIndex++) {
                    chunk += String(character);
                }
                return chunk;
            };

        beforeEach(function () {
            fName = testDir + '/test.txt';
            chunks = [];

            for(var i = 0; i < 10; i++) {
                chunks.push(createChunk(i));
            }

            fs.writeFileSync(fName, chunks.join(''));
            f = new file.File(fName);
        });

        describe('numChunks', function() {

            it('should return the correct number of chunks', function() {
                expect(f.numChunks).toEqual(10);
            });

            it('should return the correct number of chunks when uneven', function() {
                chunks = [];
                chunks.push(createChunk('a'));
                chunks.push(createChunk('b', constants.CHUNK_SIZE-2));

                fs.writeFileSync(fName, chunks.join(''));
                expect(f.numChunks).toEqual(2);
            });

        });

        describe('chunks', function() {

            it('should return the correct chunk', function() {

            })

        });
    });

});
