var fs = require('fs');
var path = require('path');
var temp = require('temp');
var helpers = require('../../helpers');

var server = helpers.require('http/server');
var Config = helpers.require('config');
var db = helpers.require('db');


var setUp = function() {
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

    server.init(config);
    db.init(config.database);

    return db.sync().then(function() {
        return {
            app: server.app,
            config: config,
            directory: directory,
            fileDirectory: fileDirectory
        }
    });
};

var tearDown = function() {
    temp.cleanupSync();
};

exports.setUp = setUp;
exports.tearDown = tearDown;
