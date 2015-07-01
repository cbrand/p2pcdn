var proto = require('./proto');
var Message = require('./message');
var ProtoChunk = proto.Chunk;

class Chunk extends Message {

    constructor(uuid, chunk) {
        super();
        this.uuid = uuid;
        this.chunk = chunk;
        this.data = null;
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
        var protoChunk = new ProtoChunk();
        protoChunk.set('UUID', this.uuid);
        protoChunk.set('chunk', this.chunk);
        protoChunk.set('data', this.data);

        protoMessage.set('.Chunk.message', protoChunk);
        return protoMessage;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoResponse} protoMessage
     * @returns Chunk
     */
    static _fromProto(protoMessage) {
        var protoChunk = protoMessage.get('.Chunk.message');
        var response = new Chunk(protoChunk.get('UUID'), protoChunk.get('chunk'));
        response.data = protoChunk.get('data');

        return response;
    }

}
Message.registerType(proto.Message.Type.CHUNK, Chunk);

export default Chunk;
