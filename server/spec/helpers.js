var path = require('path');

var distRequire = function(p) {
    return require(path.join('../dist/' + p));
};

exports.require = distRequire;
