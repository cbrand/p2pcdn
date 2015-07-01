var commonMessageModule = require('./helpers').requireCommon('messages/message');
var Message = commonMessageModule.Message;
var Chunk = commonMessageModule.Chunk;
var MessageError = commonMessageModule.Error;
var FileInfo = commonMessageModule.FileInfo;
var GetChunk = commonMessageModule.GetChunk;
var GetFileInfo = commonMessageModule.GetFileInfo;

export {
    Message,
    Chunk,
    MessageError as Error,
    FileInfo,
    GetChunk,
    GetFileInfo
};
