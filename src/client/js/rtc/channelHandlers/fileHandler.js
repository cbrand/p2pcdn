var Handler = require('./handler');
var File = require('../../db/file');
var messages = require('../../messages/message');
var ErrorResponse = messages.Error;
var ErrorCode = ErrorResponse.Code;

class FileHandler extends Handler {

    get _file() {
        var self = this;
        return File.load(self.message.uuid).catch(function(err) {
            var errorResponse;
            if(err && err.status === 404) {
                errorResponse = new ErrorResponse(ErrorCode.UUID_NOT_FOUND);
            } else {
                errorResponse = new ErrorResponse(ErrorCode.UNKNOWN);
            }
            throw errorResponse;
        });
    }

}

export default FileHandler;
