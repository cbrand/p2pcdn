var proto = require('./proto');
var Response = require('./response');
var ProtoChunk = proto.Chunk;

class Chunk extends Response {

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
     * @param {proto.Response} protoResponse
     * @protected
     */
    _updateProto(protoResponse) {
        super._updateProto(protoResponse);
        var protoChunk = new ProtoChunk();
        protoChunk.set('UUID', this.uuid);
        protoChunk.set('chunk', this.chunk);
        protoChunk.set('data', this.data);

        protoResponse.set('.Chunk.response', protoChunk);
        return protoResponse;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoResponse} protoResponse
     * @returns Chunk
     */
    static _fromProto(protoResponse) {
        var protoChunk = protoResponse.get('.Chunk.response');
        var response = new Chunk(protoChunk.get('UUID'), protoChunk.get('chunk'));
        response.data = protoChunk.get('data');

        return response;
    }

}
Response.registerType(proto.Response.Type.CHUNK, Chunk);

export default Chunk;
