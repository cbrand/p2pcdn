var path = require('path');
var ProtoBuf = require('protobufjs');
var Proto = ProtoBuf.loadProtoFile(path.join(__dirname, 'request.proto'));
var Request = Proto.build('Request');
var GetChunk = Proto.build('GetChunk');
var GetFileInfo = Proto.build('GetFileInfo');

export {
    Request,
    GetChunk,
    GetFileInfo
};
