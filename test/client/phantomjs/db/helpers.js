var Q = require('q');
var _ = require('underscore');

var fillChunksExcept = function (file, chunks, notChunkNums) {
    var promise = Q();
    if (!_.isArray(notChunkNums)) {
        if (_.isNumber(notChunkNums)) {
            notChunkNums = [notChunkNums];
        } else {
            notChunkNums = [];
        }
    }
    var addChunk = function (numChunk) {
        promise = promise.then(function () {
            return file.setChunk(numChunk, chunks[numChunk]);
        });
    };

    for (var i = 0; i < 5; i++) {
        if (_.indexOf(notChunkNums, i) === -1) {
            addChunk(i);
        }
    }
    return promise;
};

var createBase64Chunks = function(chunks) {
    return chunks.map(function(chunk) {
        return new Buffer(chunk).toString('base64');
    });
};

module.exports.fillChunksExcept = fillChunksExcept;
module.exports.createBase64Chunks = createBase64Chunks;
