var commonRequestModule = require('./helpers').requireCommon('messages/request');
var Request = commonRequestModule.Request;
var GetChunk = commonRequestModule.GetChunk;
var GetFileInfo = commonRequestModule.GetFileInfo;

export {
    Request,
    GetChunk,
    GetFileInfo
};
