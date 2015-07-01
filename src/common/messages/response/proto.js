var ProtoBuf = require('../helpers').ProtoBuf;
var Proto = ProtoBuf.loadJson(require('../definitions/response.proto'));
var Response = Proto.build('Response');
var Chunk = Proto.build('Chunk');
var ProtoError = Proto.build('Error');
var FileInfo = Proto.build('FileInfo');

export {
    Response,
    Chunk,
    ProtoError as Error,
    FileInfo
};
