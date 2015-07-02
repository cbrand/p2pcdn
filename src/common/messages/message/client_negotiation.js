var Message = require('./message');
var proto = require('./proto');
var type = proto.Message.Type.CLIENT_NEGOTIATION;

/**
 * Message for negotiating a rtc connection between
 * two clients. The server is acting as a broker and sending
 * these negotiation messages.
 */
class ClientNegotiation extends Message {

    constructor(negotiationId) {
        super();
        var self = this;
        self.id = negotiationId;
        self.negotiationType = null;
        self.payload = null;
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
        var protoClientNegotiation = new proto.ClientNegotiation();

        protoClientNegotiation.set('id', self.id);
        protoClientNegotiation.set('type', self.negotiationType);
        protoClientNegotiation.set('payload', self.payload);

        protoMessage.set('.ClientNegotiation.message', protoClientNegotiation);
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
        var protoNegotiation = protoMessage.get('.ClientNegotiation.message');
        var negotiation = new ClientNegotiation(protoNegotiation.id);
        negotiation.negotiationType = protoNegotiation.get('type');
        negotiation.payload = protoNegotiation.get('payload');

        return negotiation;
    }

}
ClientNegotiation.NegotiationType = proto.ClientNegotiation.Type;
Message.registerType(type, ClientNegotiation);

export default ClientNegotiation;