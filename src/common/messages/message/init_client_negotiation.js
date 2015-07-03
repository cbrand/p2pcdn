var Message = require('./message');
var proto = require('./proto');
var type = proto.Message.Type.INIT_CLIENT_NEGOTIATION;

/**
 * Init package to start a client negotiation to connect
 * two clients through a RTC connection.
 */
class InitClientNegotiation extends Message {

    constructor(negotiationId) {
        super();
        var self = this;
        self.id = negotiationId;
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
        var self = this;
        protoMessage.set('type', type);
        var protoInitClientNegotiation = new proto.InitClientNegotiation();

        protoInitClientNegotiation.set('id', self.id);

        protoMessage.set('.InitClientNegotiation.message', protoInitClientNegotiation);
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
        var protoNegotiation = protoMessage.get('.InitClientNegotiation.message');
        return new InitClientNegotiation(protoNegotiation.id);
    }

}
Message.registerType(type, InitClientNegotiation);

export default InitClientNegotiation;
