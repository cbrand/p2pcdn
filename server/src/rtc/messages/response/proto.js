var ProtoBuf = require('protobufjs');
var Proto = ProtoBuf.loadProtoFile(__dirname + '/response.proto');
var Response = Proto.build('Response');
var Chunk = Proto.build('Chunk');
var Error = Proto.build('Error');
var FileInfo = Proto.build('FileInfo');

export {
    Response,
    Chunk,
    Error,
    FileInfo
}
