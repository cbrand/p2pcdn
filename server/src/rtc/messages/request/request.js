var proto = require('./proto');
var ProtoRequest = proto.Request;
var protoHelpers = require('../../../proto/helpers');

var types = {};
var registerType = function(name, cl) {
    types[name] = cl;
    cl.prototype.type = name;
    cl.type = name;
};

class Request {

    /**
     * Serializes the request and returns the byte representation of it.
     * @returns Promise.<ArrayBuffer>
     */
    serialize() {
        var self = this;
        return protoHelpers.serialize(self, ProtoRequest);
    }

    /**
     * Parses the byte data in this array and returns the object.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @returns Promise.<Request>
     */
    static deserialize(arrayBuffer) {
        return protoHelpers.deserializeWithTypes(arrayBuffer, ProtoRequest, types);
    }

    /*eslint-disable no-unused-vars */
    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {ProtoRequest} protoRequest
     * @protected
     */
    _updateProto(protoRequest) {

    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoRequest} protoRequest
     * @returns Request
     */
    static _fromProto(protoRequest) {

    }
    /*eslint-enable */

    /**
     * Registers the type to the internal registry.
     * @param name
     * @param cl
     */
    static registerType(name, cl) {
        registerType(name, cl);
    }
}

export default Request;
