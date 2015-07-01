var Request = require('./request');
var proto = require('./proto');
var type = proto.Request.Type.GET_CHUNK;

/**
 * Request to get a specific uuid chunk.
 */
class GetChunk extends Request {

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
     * @param {proto.Request} protoRequest
     * @protected
     */
    _updateProto(protoRequest) {
        super._updateProto(protoRequest);
        protoRequest.set('type', type);
        var requestGetChunk = new proto.GetChunk();
        requestGetChunk.set('UUID', this.uuid);
        requestGetChunk.set('chunk', this.chunk);

        protoRequest.set('.GetChunk.request', requestGetChunk);
        return protoRequest;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Request} protoRequest
     * @returns GetChunk
     */
    static _fromProto(protoRequest) {
        var protoGetChunk = protoRequest.get('.GetChunk.request');
        return new GetChunk(protoGetChunk.get('UUID'), protoGetChunk.get('chunk'));
    }

}
Request.registerType(type, GetChunk);

export default GetChunk;
