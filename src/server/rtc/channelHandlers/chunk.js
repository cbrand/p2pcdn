var Encoder = require('text-encoding').TextEncoder;

var FileHandler = require('./fileHandler');
var messages = require('../messages');
var GetChunkRequest = messages.GetChunk;
var ChunkResponse = messages.Chunk;
var ErrorResponse = messages.Error;

class ChunkHandler extends FileHandler {

    /**
     * returns if the channel handler does support
     * the given request.
     * @returns {boolean}
     */
    supports() {
        return this.message instanceof GetChunkRequest;
    }

    get _chunk() {
        var self = this;
        return self._file.then(function(file) {
            return file.chunk(self.message.chunk);
        }).catch(function(err) {
            if(!(err instanceof ErrorResponse)) {
                err = new ErrorResponse(ErrorResponse.Code.CHUNK_OUT_OF_BOUNDS);
            }
            throw err;
        });
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Response>}
     */
    handle() {
        var self = this;
        return self._chunk.then(function(chunkData) {
            var response = new ChunkResponse(self.message.uuid, self.message.chunk);
            response.data = new Encoder('utf8').encode(chunkData);
            return response;
        });
    }

}

export default ChunkHandler;
