var FileHandler = require('./file_handler');
var messages = require('../../messages/message');
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
        var chunk = self.message.chunk;
        return self._file.then(function(file) {
            if(chunk < 0 || chunk >= file.numChunks) {
                throw new ErrorResponse(ErrorResponse.Code.CHUNK_OUT_OF_BOUNDS);
            }
            return file.getChunk(chunk);
        }).catch(function(err) {
            if(!(err instanceof ErrorResponse)) {
                err = new ErrorResponse(ErrorResponse.Code.CHUNK_NOT_FOUND);
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
            response.data = chunkData;
            return response;
        });
    }

}

export default ChunkHandler;
