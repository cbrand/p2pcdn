var path = require('path');

var requireCommon = function(p) {
    return require(path.join(__dirname, '../../../common', p));
};

export {
    requireCommon
};
