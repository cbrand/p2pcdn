var Message = require('./message');
var proto = require('./proto');

class GetPeerFor extends Message {
    /**
     * @param {String} UUID the uuid of the file
     * @param {Array.<Number>} neededChunks The chunks still needed by the peer.
     */
    constructor(UUID, neededChunks) {
        super();
        this.UUID = UUID;
        this.neededChunks = neededChunks || [];
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
        var requestGetChunk = new proto.GetPeerFor();
        requestGetChunk.set('forFileUUID', this.UUID);
        requestGetChunk.set('neededChunks', this.neededChunks);

        protoMessage.set('.GetPeerFor.message', requestGetChunk);
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
        var protoGetChunk = protoMessage.get('.GetPeerFor.message');
        var peerFor = new GetPeerFor(
            protoGetChunk.get('forFileUUID'),
            protoGetChunk.get('neededChunks')
        );
        peerFor._setFromProto(protoMessage);
        return peerFor;
    }
}
Message.registerType(proto.Message.Type.GET_PEER_FOR, GetPeerFor);

export default GetPeerFor;
