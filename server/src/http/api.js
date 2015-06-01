var express = require('express');
var HttpStatus = require('http-status-codes');

var api = express.Router();

api.param('fileUUID', function(req, res, next, uuid) {
    var fileHandler = req.app.get('fileHandler');
    fileHandler.get(uuid).then(function(file) {
        req.file = file;
        next();
    }).catch(function(err) {
        /* istanbul ignore else: This should never happen */
        if(err && err.isNotExist) {
            res.status(HttpStatus.NOT_FOUND).send({
                error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
            });
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
            });
        }
        next(new Error('Not found'));
    });
});

api.get('/files/:fileUUID', function(req, res) {
    var file = req.file;
    res.status(HttpStatus.OK).send({
        uuid: file.uuid,
        fileName: file.fileName,
        mediaType: file.mediaType,
        chunks: file.numChunks
    });
});

export default api;
