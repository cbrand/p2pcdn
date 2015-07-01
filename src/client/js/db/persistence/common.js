var Q = require('q');
var dbFile = require('./file');

var truncate = function() {
    return Q.all([
        dbFile.truncate()
    ]);
};

export {
    truncate
};
