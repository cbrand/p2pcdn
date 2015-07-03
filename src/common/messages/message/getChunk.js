var Message = require('./message');
var proto = require('./proto');
var type = proto.Message.Type.GET_CHUNK;

/**
 * Request to get a specific uuid chunk.
 */
class GetChunk extends Message {

    /**
     * @param {String} uuid the uuid of the file
     * @param {int} chunk the chunk of the given entry.
     */
    constructor(uuid, chunk) {
        super();
        this.uuid = uuid;
        this.chunk = chunk;
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
        var requestGetChunk = new proto.GetChunk();
        requestGetChunk.set('UUID', this.uuid);
        requestGetChunk.set('chunk', this.chunk);

        protoMessage.set('.GetChunk.message', requestGetChunk);
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
        var protoGetChunk = protoMessage.get('.GetChunk.message');
        return new GetChunk(
            protoGetChunk.get('UUID'),
            protoGetChunk.get('chunk')
        )._setFromProto(protoMessage);
    }

}
Message.registerType(type, GetChunk);

export default GetChunk;
