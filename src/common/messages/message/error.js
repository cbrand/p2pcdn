var Message = require('./message');
var proto = require('./proto');
var ProtoError = proto.Error;

var errorMessages = {};
errorMessages[ProtoError.Code.CHUNK_OUT_OF_BOUNDS] = 'The given chunk id is out of bounds.';
errorMessages[ProtoError.Code.CHUNK_NOT_FOUND] = 'The chunk does not exist on the requested system';
errorMessages[ProtoError.Code.UUID_NOT_FOUND] = 'Could find nothing under the given uuid';

class Error extends Message {

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
     * @param {proto.Message} protoMessage
     * @protected
     */
    _updateProto(protoMessage) {
        super._updateProto(protoMessage);
        var protoError = new ProtoError();
        protoError.set('code', this.code);

        protoMessage.set('.Error.message', protoError);
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
        var protoError = protoMessage.get('.Error.message');
        return new Error(protoError.get('code'));
    }

}
Error.Code = ProtoError.Code;
Message.registerType(proto.Message.Type.ERROR, Error);

export default Error;
