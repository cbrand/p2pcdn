var proto = require('./proto');
var ProtoResponse = proto.Response;
var protoHelpers = require('../../../proto/helpers');

var types = {};
var registerType = function(name, cl) {
    types[name] = cl;
    cl.prototype.type = name;
    cl.type = name;
};

class Response {

    /**
     * Serializes the response and returns the byte representation of it.
     * @returns {Promise.<ArrayBuffer>}
     */
    serialize() {
        return protoHelpers.serialize(this, ProtoResponse);
    }

    /**
     * Parses the byte data in this array and returns the object.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @returns Promise.<Response>
     */
    static deserialize(arrayBuffer) {
        return protoHelpers.deserializeWithTypes(arrayBuffer, ProtoResponse, types);
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {ProtoResponse} protoResponse
     * @protected
     */
    _updateProto(protoResponse) {
        protoResponse.set('type', this.type);
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoResponse} protoResponse
     * @returns Response
     */
    static _fromProto(protoResponse) {
        protoResponse;
    }

    static registerType(name, cl) {
        registerType(name, cl);
    }
}

export default Response;
