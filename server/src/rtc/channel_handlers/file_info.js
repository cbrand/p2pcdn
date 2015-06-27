var TextEncoder = require('text-encoding').TextEncoder;

var FileHandler = require('./file_handler');
var messages = require('../messages');
var GetFileInfo = messages.request.GetFileInfo;
var FileResponse = messages.response.FileInfo;


class FileInfo extends FileHandler {

    supports() {
        return this.request instanceof GetFileInfo;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Response>}
     */
    handle() {
        var self = this;
        return self._file.then(function (file) {
            var response = new FileResponse(file.uuid);
            response.name = file.fileName;
            response.mimeType = file.mimeType;
            response.numChunks = file.numChunks;
            return response;
        });
    }

}

export default FileInfo;
