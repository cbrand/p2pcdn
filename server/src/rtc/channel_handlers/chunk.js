var TextEncoder = require('text-encoding').TextEncoder;

var Handler = require('./handler');
var messages = require('../messages');
var GetChunkRequest = messages.request.GetChunk;
var ChunkResponse = messages.response.Chunk;
var ErrorResponse = messages.response.Error;

class ChunkHandler extends Handler {

    get _fileHandler() {
        return this.app.fileHandler;
    }

    /**
     * returns if the channel handler does support
     * the given request.
     * @returns {boolean}
     */
    supports() {
        return this.request instanceof GetChunkRequest;
    }

    get _file() {
        var self = this;
        return self._fileHandler.get(self.request.uuid).catch(function(err) {
            var errorResponse;
            if(err && err.isNotExist) {
                errorResponse = new ErrorResponse(ErrorResponse.Code.UUID_NOT_FOUND);
            } else {
                errorResponse = new ErrorResponse(ErrorResponse.Code.UNKNOWN)
            }
            throw errorResponse;
        });
    }

    get _chunk() {
        var self = this;
        return self._file.then(function(file) {
            return file.chunk(self.request.chunk);
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
            var response = new ChunkResponse(self.request.uuid, self.request.chunk);
            response.data = new TextEncoder('utf8').encode(chunkData);
            return response;
        });
    }

}

export default ChunkHandler;
