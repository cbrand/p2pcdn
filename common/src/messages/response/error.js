var Response = require('./response');
var proto = require('./proto');
var ProtoError = proto.Error;

var errorMessages = {};
errorMessages[ProtoError.Code.CHUNK_OUT_OF_BOUNDS] = 'The given chunk id is out of bounds.';
errorMessages[ProtoError.Code.UUID_NOT_FOUND] = 'Could find nothing under the given uuid';

class Error extends Response {

    constructor(code) {
        super();
        this.code = code;
    }

    get message() {
        if(!errorMessages[this.code]) {
            return 'UNKNOWN';
        } else {
            return errorMessages[this.code];
        }
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
        var protoError = new ProtoError();
        protoError.set('code', this.code);

        protoResponse.set('.Error.response', protoError);
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
        var protoError = protoResponse.get('.Error.response');
        return new Error(protoError.get('code'));
    }

}
Error.Code = ProtoError.Code;
Response.registerType(proto.Response.Type.ERROR, Error);

export default Error;
