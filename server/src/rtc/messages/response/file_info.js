var proto = require('./proto');
var Response = require('./response');
var ProtoChunk = proto.Chunk;

class FileInfo extends Response {

    constructor(uuid) {
        super();
        this.uuid = uuid;
        this.name = null;
        this.mimeType = null;
        this.numChunks = 0;
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {proto.Response} protoResponse
     * @protected
     */
    _updateProto(protoResponse) {
        super._updateProto(protoResponse);
        var protoFileInfo = new proto.FileInfo();
        protoFileInfo.set('UUID', this.uuid);
        protoFileInfo.set('name', this.name);
        protoFileInfo.set('mimeType', this.mimeType);
        protoFileInfo.set('numChunks', this.numChunks);

        protoResponse.set('.FileInfo.response', protoFileInfo);
        return protoResponse;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Response} protoResponse
     * @returns Chunk
     */
    static _fromProto(protoResponse) {
        var protoFileInfo = protoResponse.get('.FileInfo.response');
        var response = new FileInfo(protoFileInfo.get('UUID'));
        response.name = protoFileInfo.get('name');
        response.mimeType = protoFileInfo.get('mimeType');
        response.numChunks = protoFileInfo.get('numChunks');

        return response;
    }

}
Response.registerType(proto.Response.Type.FILE_INFO, FileInfo);

export default FileInfo;
