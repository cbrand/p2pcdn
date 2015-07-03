var Message = require('./message');
var proto = require('./proto');
var type = proto.Message.Type.GET_PEER_FOR;

class GetPeerFor extends Message {
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
        var requestGetChunk = new proto.GetPeerFor();
        requestGetChunk.set('forFileUUID', this.uuid);

        protoMessage.set('.GetPeerFor.message', requestGetChunk);
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
        var protoGetChunk = protoMessage.get('.GetPeerFor.message');
        return new GetPeerFor(protoGetChunk.get('forFileUUID'));
    }
}
Message.registerType(type, GetPeerFor);

export default GetPeerFor;
