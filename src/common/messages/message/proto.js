var ProtoBuf = require('../helpers').ProtoBuf;
var Proto = ProtoBuf.loadJson(require('../definitions/message.proto'));

var Message = Proto.build('Message');

var ClientNegotiation = Proto.build('ClientNegotiation');
var ProtoError = Proto.build('Error');
var Init = Proto.build('Init');
var InitClientNegotiation = Proto.build('InitClientNegotiation');
var RequestPeersFor = Proto.build('RequestPeersFor');

var GetChunk = Proto.build('GetChunk');
var GetFileInfo = Proto.build('GetFileInfo');
var GetPeerFor = Proto.build('GetPeerFor');

var Chunk = Proto.build('Chunk');
var FileInfo = Proto.build('FileInfo');


export {
    Message,

    ClientNegotiation,
    ProtoError as Error,
    Init,
    InitClientNegotiation,
    RequestPeersFor,

    GetChunk,
    GetFileInfo,
    GetPeerFor,

    Chunk,
    FileInfo
};
