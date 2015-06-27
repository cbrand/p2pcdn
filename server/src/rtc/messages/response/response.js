var Q = require('q');
var proto = require('./proto');
var ProtoResponse = proto.Response;

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
        var self = this;
        var protoResponse = new ProtoResponse();
        var deferred = Q.defer();
        setImmediate(deferred.resolve);

        return deferred.promise.then(function() {
            return self._updateProto(protoResponse);
        }).then(function() {
            return protoResponse.toArrayBuffer();
        });
    }

    /**
     * Parses the byte data in this array and returns the object.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @returns Promise.<Response>
     */
    static deserialize(arrayBuffer) {
        var protoResponse = ProtoResponse.decode(arrayBuffer);

        if(!types[protoResponse.type]) {
            throw new Error('Unknown type for deserialization');
        }

        var deferred = Q.defer();
        setImmediate(deferred.resolve);
        var t = types[protoResponse.type];
        return deferred.promise.then(function() {
            return t._fromProto(protoResponse);
        });
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

    }

    static registerType(name, cl) {
        registerType(name, cl);
    }
}

export default Response;
