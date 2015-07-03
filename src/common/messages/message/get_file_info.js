var Message = require('./message');
var proto = require('./proto');
var type = proto.Message.Type.GET_FILE_INFO;

class GetFileInfo extends Message {
    /**
     * @param {String} uuid the uuid of the file
     */
    constructor(uuid) {
        super();
        this.uuid = uuid;
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
        protoMessage.set('type', type);
        var requestGetChunk = new proto.GetFileInfo();
        requestGetChunk.set('UUID', this.uuid);

        protoMessage.set('.GetFileInfo.message', requestGetChunk);
        return protoMessage;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Message} protoMessage
     * @returns GetChunk
     */
    static _fromProto(protoMessage) {
        var protoGetChunk = protoMessage.get('.GetFileInfo.message');
        return new GetFileInfo(protoGetChunk.get('UUID'))._setFromProto(protoMessage);
    }
}
Message.registerType(type, GetFileInfo);

export default GetFileInfo;
