var Q = require('q');
var proto = require('./proto');
var ProtoRequest = proto.Request;

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
        var protoRequest = new ProtoRequest();
        var deferred = Q.defer();
        setImmediate(deferred.resolve);

        return deferred.promise.then(function() {
            return self._updateProto(protoRequest);
        }).then(function() {
            return protoRequest.toArrayBuffer();
        });
    }

    /**
     * Parses the byte data in this array and returns the object.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @returns Promise.<Request>
     */
    static deserialize(arrayBuffer) {
        var protoRequest = ProtoRequest.decode(arrayBuffer);

        if(!types[protoRequest.type]) {
            throw new Error('Unknown type for deserialization');
        }

        var deferred = Q.defer();
        setImmediate(deferred.resolve);
        var t = types[protoRequest.type];
        return deferred.promise.then(function() {
            return t._fromProto(protoRequest);
        });
    }

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
