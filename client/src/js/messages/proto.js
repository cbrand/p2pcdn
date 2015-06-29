var ProtoBuf = require('protobufjs/dist/ProtoBuf-light');
var negotiationJSON = require('./negotiation.proto.json');
var requestJSON = require('./request.proto.json');
var responseJSON = require('./response.proto.json');

var NegotiationBuilder = ProtoBuf.loadJson(negotiationJSON);
var RequestBuilder = ProtoBuf.loadJson(requestJSON);
var ResponseBuilder = ProtoBuf.loadJson(responseJSON);

export {
    NegotiationBuilder,
    RequestBuilder,
    ResponseBuilder
};
