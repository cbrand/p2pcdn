var proto = require('./proto');
var Message = require('./message');

class FileInfo extends Message {

    constructor(uuid) {
        super();
        this.uuid = uuid;
        this.name = null;
        this.mimeType = null;
        this.numChunks = 0;
        this.missingChunks = [];
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {proto.Message} protoMessage
     * @protected
     */
    _updateProto(protoMessage) {
        super._updateProto(protoMessage);
        var protoFileInfo = new proto.FileInfo();
        protoFileInfo.set('UUID', this.uuid);
        protoFileInfo.set('name', this.name);
        protoFileInfo.set('mimeType', this.mimeType);
        protoFileInfo.set('numChunks', this.numChunks);
        protoFileInfo.set('missingChunks', this.missingChunks);

        protoMessage.set('.FileInfo.message', protoFileInfo);
        return protoMessage;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Message} protoMessage
     * @returns Chunk
     */
    static _fromProto(protoMessage) {
        var protoFileInfo = protoMessage.get('.FileInfo.message');
        var response = new FileInfo(protoFileInfo.get('UUID'));
        response.name = protoFileInfo.get('name');
        response.mimeType = protoFileInfo.get('mimeType');
        response.numChunks = protoFileInfo.get('numChunks');
        response.missingChunks = protoFileInfo.get('missingChunks') || [];
        response._setFromProto(protoMessage);

        return response;
    }

}
Message.registerType(proto.Message.Type.FILE_INFO, FileInfo);

export default FileInfo;
