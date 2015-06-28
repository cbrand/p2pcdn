var ProtoBuf = require('protobufjs');
var path = require('path');
var Proto = ProtoBuf.loadProtoFile(path.join(__dirname, 'response.proto'));
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
