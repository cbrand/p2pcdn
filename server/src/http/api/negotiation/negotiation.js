var ProtoNegotiation = require('./proto').Negotiation;
var protoHelpers = require('../../../proto/helpers');

class Negotiation {

    constructor() {
        this.type = null;
        this.payload = null;
    }

    /**
     * Serializes the response and returns the byte representation of it.
     * @returns {Promise.<ArrayBuffer>}
     */
    serialize() {
        return protoHelpers.serialize(this, ProtoNegotiation);
    }

    /**
     * Parses the byte data in this array and returns the object.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @returns Promise.<Negotiation>
     */
    static deserialize(arrayBuffer) {
        return protoHelpers.deserializeWith(arrayBuffer, ProtoNegotiation, Negotiation);
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {ProtoNegotiation} protoNegotiation
     * @protected
     */
    _updateProto(protoNegotiation) {
        protoNegotiation.set('type', this.type);
        var jsonPayload = JSON.stringify(this.payload);
        protoNegotiation.set('payload', new Buffer(jsonPayload, 'utf8'));
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoNegotiation} protoNegotiation
     * @returns Response
     */
    static _fromProto(protoNegotiation) {
        var negotiation = new Negotiation();
        negotiation.type = protoNegotiation.get('type');
        var payload = protoNegotiation.get('payload');
        negotiation.payload = JSON.parse(payload.toString('utf8'));
        return negotiation;
    }

}
Negotiation.Type = ProtoNegotiation.Type;

export default Negotiation;
