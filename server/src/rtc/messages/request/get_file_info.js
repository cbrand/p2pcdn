var Request = require('./request');
var proto = require('./proto');
var type = proto.Request.Type.GET_FILE_INFO;

class GetFileInfo extends Request {
    /**
     * @param {String} uuid the uuid of the file
     */
    constructor(uuid) {
        super();
        this.uuid = uuid;
    }

    /**
     * Updates a protocol buffer with the representation of the given
     * javascript object.
     *
     * @param {proto.Request} protoRequest
     * @protected
     */
    _updateProto(protoRequest) {
        super._updateProto(protoRequest);
        protoRequest.set('type', type);
        var requestGetChunk = new proto.GetFileInfo();
        requestGetChunk.set('UUID', this.uuid);

        protoRequest.set('.GetFileInfo.request', requestGetChunk);
        return protoRequest;
    }

    /**
     * Updates this object with the data being provided
     * by the proto request.
     *
     * @param {proto.Request} protoRequest
     * @returns GetChunk
     */
    static _fromProto(protoRequest) {
        var protoGetChunk = protoRequest.get('.GetFileInfo.request');
        return new GetFileInfo(protoGetChunk.get('UUID'));
    }
}
Request.registerType(type, GetFileInfo);

export default GetFileInfo;
