var path = require('path');
var ProtoBuf = require('../helpers').ProtoBuf;
var Proto = ProtoBuf.loadJson(require('../definitions/request.proto'));
var Request = Proto.build('Request');
var GetChunk = Proto.build('GetChunk');
var GetFileInfo = Proto.build('GetFileInfo');

export {
    Request,
    GetChunk,
    GetFileInfo
};
