var ProtoBuf = require('../helpers').ProtoBuf;
var Proto = ProtoBuf.loadJson(require('../definitions/negotiation.proto'));
var Negotiation = Proto.build('Negotiation');

export {
    Negotiation
};
