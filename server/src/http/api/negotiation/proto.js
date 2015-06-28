var ProtoBuf = require('protobufjs');
var path = require('path');
var Proto = ProtoBuf.loadProtoFile(path.join(__dirname, 'negotiation.proto'));
var Negotiation = Proto.build('Negotiation');

export {
    Negotiation
};
