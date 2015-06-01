var stream = require('stream');
var path = require('path');

var distRequire = function(p) {
    return require(path.join('../dist/' + p));
};

exports.require = distRequire;
exports.readableStream = function() {
    var s = new stream.Readable();
    s._read = function noop() {};
    var args = arguments;
    setImmediate(function() {
        for (var i = 0; i < args.length; i++) {
            s.push(args[i]);
        }
        s.push(null);
    });
    return s;
};
