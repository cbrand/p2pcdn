var ProtoBuf = require('protobufjs');
var Proto = ProtoBuf.loadProtoFile(__dirname + '/negotiation.proto');
var Negotiation = Proto.build('Negotiation');

export {
    Negotiation
}
