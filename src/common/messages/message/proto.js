var path = require('path');
var ProtoBuf = require('../helpers').ProtoBuf;
var Proto = ProtoBuf.loadJson(require('../definitions/message.proto'));

var Message = Proto.build('Message');

var ProtoError = Proto.build('Error');

var GetChunk = Proto.build('GetChunk');
var GetFileInfo = Proto.build('GetFileInfo');

var Chunk = Proto.build('Chunk');
var FileInfo = Proto.build('FileInfo');


export {
    Message,

    ProtoError as Error,

    GetChunk,
    GetFileInfo,

    Chunk,
    FileInfo
};
