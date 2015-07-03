var Message = require('./message');
var proto = require('./proto');
var type = proto.Message.Type.INIT;

/**
 * Request to get a specific uuid chunk.
 */
class Init extends Message {

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {proto.Message} protoMessage
     * @protected
     */
    _updateProto(protoMessage) {
        super._updateProto(protoMessage);
        var initChunk = new proto.Init();

        protoMessage.set('.Init.message', initChunk);
        return protoMessage;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Message} protoMessage
     * @returns Init
     */
    static _fromProto(protoMessage) {
        return new Init()._setFromProto(protoMessage);
    }

}
Message.registerType(type, Init);

export default Init;
