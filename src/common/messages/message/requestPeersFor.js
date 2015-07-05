var Message = require('./message');
var proto = require('./proto');

class RequestPeersFor extends Message {
    constructor(UUID, neededChunks) {
        super();
        var self = this;
        self.UUID = UUID;
        self.neededChunks = neededChunks;
        self.numPeers = null;
    }

    get uuid() {
        return this.UUID;
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
        var protoRequestPeersFor = new proto.RequestPeersFor();
        protoRequestPeersFor.set('forFileUUID', this.UUID);
        protoRequestPeersFor.set('neededChunks', this.neededChunks);
        protoRequestPeersFor.set('numPeers', this.numPeers);

        protoMessage.set('.RequestPeersFor.message', protoRequestPeersFor);
        return protoMessage;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Message} protoMessage
     * @returns RequestPeersFor
     */
    static _fromProto(protoMessage) {
        var protoGetChunk = protoMessage.get('.RequestPeersFor.message');
        var peerFor = new RequestPeersFor(
            protoGetChunk.get('forFileUUID'),
            protoGetChunk.get('neededChunks')
        );
        peerFor.numPeers = protoGetChunk.get('numPeers');
        peerFor._setFromProto(protoMessage);
        return peerFor;
    }

}
Message.registerType(proto.Message.Type.REQUEST_PEERS_FOR, RequestPeersFor);

export default RequestPeersFor;
