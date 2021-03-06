var Q = require('q');
var ProtoBuf = require('protobufjs/dist/ProtoBuf-light.js');

var serialize = function(instance, protoClass) {
    var protoObj = new protoClass();

    return Q().then(function() {
        return instance._updateProto(protoObj);
    }).then(function() {
        return protoObj.toArrayBuffer();
    });
};

var deserialize = function(Class, protoInstance) {
    return Q().then(function() {
        return Class._fromProto(protoInstance);
    });
};

var deserializeWithTypes = function(arrayBuffer, protoClass, types) {
    var protoInstance = protoClass.decode(arrayBuffer);

    if(!types || !types[protoInstance.type]) {
        throw new Error('Unknown type for deserialization');
    }

    var t;
    t = types[protoInstance.type];

    return deserialize(t, protoInstance);
};

var deserializeWith = function(arrayBuffer, protoClass, Class) {
    var protoInstance = protoClass.decode(arrayBuffer);

    return deserialize(Class, protoInstance);
};


export {
    deserializeWithTypes,
    deserializeWith,
    ProtoBuf,
    serialize
};
