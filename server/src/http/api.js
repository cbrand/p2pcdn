var express = require('express');
var HttpStatus = require('http-status-codes');

var api = express.Router();

api.get('/files/:uuid', function(req, res) {
    var fileHandler = req.app.get('fileHandler');

    fileHandler.get(req.params.uuid).then(function(file) {
        res.status(HttpStatus.OK).send({
            uuid: file.uuid,
            fileName: file.fileName,
            mediaType: file.mediaType,
            chunks: file.numChunks
        });
    }).catch(function(err) {
        if(err && err.isNotExist) {
            res.status(HttpStatus.NOT_FOUND).send({
                error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
            });
            return;
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
        });
    });
});

export default api;
