var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var path = require('path');
var isNode = (typeof window !== 'undefined' && window.isNode);
if(isNode === undefined || typeof window === 'undefined') {
    isNode = true;
}

var req = require;
if(isNode) {
    req = function(p) {
        return require(path.join(__dirname, '../../dist/server/' + p));
    };
}

module.exports.require = req;
module.exports.chai = chai;
module.exports.isNode = isNode;
