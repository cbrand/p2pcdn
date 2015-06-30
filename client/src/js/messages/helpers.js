var Q = require('q');

var serialize = function(instance, protoClass) {
    var protoObj = new protoClass();
    var deferred = Q.defer();
    setImmediate(deferred.resolve);

    return deferred.promise.then(function() {
        return instance._updateProto(protoObj);
    }).then(function() {
        return protoObj.toArrayBuffer();
    });
};

var deserialize = function(Class, protoInstance) {
    var deferred = Q.defer();
    setTimeout(deferred.resolve, 0);
    return deferred.promise.then(function() {
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
    serialize,
    deserializeWithTypes,
    deserializeWith
};
