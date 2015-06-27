var Q = require('q');
var ProtoBuf = require('protobufjs');
var Proto = ProtoBuf.loadProtoFile(__dirname + '/request.proto');
var ProtoRequest = Proto.build('Request');
var ProtoGetChunk = Proto.build('GetChunk');

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
}

/**
 * Request to get a specific uuid chunk.
 */
class GetChunk extends Request {

    /**
     * @param {String} uuid the uuid of the file
     * @param {int} chunk the chunk of the given entry.
     */
    constructor(uuid, chunk) {
        super();
        this.uuid = uuid;
        this.chunk = chunk;
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {ProtoRequest} protoRequest
     * @protected
     */
    _updateProto(protoRequest) {
        super._updateProto(protoRequest);
        protoRequest.set('type', ProtoRequest.Type.GET_CHUNK);
        var requestGetChunk = new ProtoGetChunk();
        requestGetChunk.set('UUID', this.uuid);
        requestGetChunk.set('chunk', this.chunk);

        protoRequest.set('.GetChunk.request', requestGetChunk);
        return protoRequest;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoRequest} protoRequest
     * @returns GetChunk
     */
    static _fromProto(protoRequest) {
        var protoGetChunk = protoRequest.get('.GetChunk.request');
        return new GetChunk(protoGetChunk.get('UUID'), protoGetChunk.get('chunk'));
    }

}
registerType(ProtoRequest.Type.GET_CHUNK, GetChunk);

export {
    Request,
    GetChunk
}
