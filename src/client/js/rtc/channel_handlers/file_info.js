var FileHandler = require('./file_handler');
var messages = require('../../messages/message');
var GetFileInfo = messages.GetFileInfo;
var FileResponse = messages.FileInfo;
var ErrorResponse = messages.Error;


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
        var file;
        return self._file.then(function (loadedFile) {
            file = loadedFile;
            return file.missingChunks();
        }).then(function(missingChunks) {
            var response = new FileResponse(file.uuid);
            response.name = file.name;
            response.mimeType = file.mimeType;
            response.numChunks = file.numChunks;
            response.missingChunks = missingChunks;
            return response;
        }).catch(function(err) {
            if(err instanceof ErrorResponse) {
                throw err;
            }
            console.warning(
                'Tried to retrieve information of file with id ' + self.message.id +
                    'this failed with error.'
            );
            console.warning(err);
            throw new ErrorResponse(ErrorResponse.Code.UNKNOWN);
        });
    }

}

export default FileInfo;
