var proto = require('./proto');
var ProtoMessage = proto.Message;
var protoHelpers = require('../helpers');

var types = {};
var registerType = function(name, cl) {
    types[name] = cl;
    cl.prototype.type = name;
    cl.type = name;
};

class Message {

    /**
     * Creates the message.
     */
    constructor() {
       this.streamId = null;
    }

    /**
     * Serializes the request and returns the byte representation of it.
     * @returns Promise.<ArrayBuffer>
     */
    serialize() {
        var self = this;
        return protoHelpers.serialize(self, ProtoMessage);
    }

    /**
     * Parses the byte data in this array and returns the object.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @returns Promise.<Request>
     */
    static deserialize(arrayBuffer) {
        return protoHelpers.deserializeWithTypes(arrayBuffer, ProtoMessage, types);
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {ProtoMessage} protoMessage
     * @protected
     */
    _updateProto(protoMessage) {
        protoMessage.set('streamId', this.streamId);
    }

    _setFromProto(protoMessage) {
        var self = this;
        self.streamId = protoMessage.get('streamId');
        return self;
    }

    /*eslint-disable no-unused-vars */
    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {ProtoMessage} protoRequest
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

export default Message;
