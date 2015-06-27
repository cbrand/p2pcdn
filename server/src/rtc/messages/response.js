var Q = require('q');
var ProtoBuf = require('protobufjs');
var Proto = ProtoBuf.loadProtoFile(__dirname + '/response.proto');
var ProtoResponse = Proto.build('Response');
var ProtoChunk = Proto.build('Chunk');
var ProtoError = Proto.build('Error');

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
        }).then(function() {
            return t;
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
}

var errorMessages = {};
errorMessages[ProtoError.Code.CHUNK_OUT_OF_BOUNDS] = 'The given chunk id is out of bounds.';

class Error extends Response {

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
     * @param {ProtoResponse} protoResponse
     * @protected
     */
    _updateProto(protoResponse) {
        super._updateProto(protoResponse);
        var protoError = new ProtoError();
        protoError.set('code', this.code);

        protoResponse.set('.Error.response', protoError);
        return protoResponse;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoResponse} protoResponse
     * @returns Chunk
     */
    static _fromProto(protoResponse) {
        var protoChunk = protoResponse.get('.Chunk.response');
        var response = new Chunk(protoChunk.get('UUID'));
        response.data = protoChunk.get('data');

        return response;
    }

}
Error.Code = ProtoError.Code;
registerType(ProtoResponse.Type.ERROR, Error);

class Chunk extends Response {

    constructor(uuid) {
        super();
        this.uuid = uuid;
        this.data = null;
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {ProtoResponse} protoResponse
     * @protected
     */
    _updateProto(protoResponse) {
        super._updateProto(protoResponse);
        var protoChunk = new ProtoChunk();
        protoChunk.set('UUID', this.uuid);
        protoChunk.set('data', this.data);

        protoResponse.set('.Chunk.response', protoChunk);
        return protoResponse;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoResponse} protoResponse
     * @returns Chunk
     */
    static _fromProto(protoResponse) {
        var protoChunk = protoResponse.get('.Chunk.response');
        var response = new Chunk(protoChunk.get('UUID'));
        response.data = protoChunk.get('data');

        return response;
    }

}
registerType(ProtoResponse.Type.CHUNK, Chunk);

export {
    Response,
    Chunk
}
