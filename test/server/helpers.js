var fs = require('fs');
var stream = require('stream');
var path = require('path');
var chai = require('chai');
var temp = require('temp');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var distRequire = function(p) {
    return require(path.join('../../dist/server/' + p));
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
exports.chai = chai;
exports.getApp = function() {
    var App = distRequire('app');
    var Config = distRequire('config');
    var db = distRequire('db');
    temp.track();

    var directory = temp.mkdirSync();
    var fileDirectory = path.join(directory, 'files');
    fs.mkdirSync(fileDirectory);

    var config = new Config();
    config.config = {
        fileDirectory: fileDirectory,
        database: {
            type: 'sqlite',
            path: path.join(directory, 'p2pcdn.db')
        }
    };

    db.init(config.database);
    return db.sync().then(function() {
        return new App(config);
    });
};
exports.cleanUp = function() {
    temp.cleanupSync();
};
exports.connectedChannels = function(app) {
    var RTCChannelMock = require('../common/rtc/helpers').RTCChannelMock;
    var ChannelHandler = distRequire('rtc/channelHandler');

    var firstChannelMock = new RTCChannelMock();
    var secondChannelMock = new RTCChannelMock();
    firstChannelMock.connect(secondChannelMock);
    secondChannelMock.connect(firstChannelMock);

    var firstChannelWrapper = new ChannelHandler(app || null, firstChannelMock);
    var secondChannelWrapper = new ChannelHandler(app || null, secondChannelMock);

    return {
        channel: {
            left: firstChannelMock,
            right: secondChannelMock
        },
        handler: {
            left: firstChannelWrapper,
            right: secondChannelWrapper
        }
    };
};
