var FileHandler = require('./fileHandler');
var messages = require('../messages');
var GetFileInfo = messages.GetFileInfo;
var FileResponse = messages.FileInfo;


class FileInfo extends FileHandler {

    supports() {
        return this.message instanceof GetFileInfo;
    }

    /**
     * Handles the given request.
     * @returns {Promise.<Message>}
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
