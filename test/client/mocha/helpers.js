var Q = require('q');
var path = require('path');
var apiHelpers = require('../../server/http/api/helpers');
var serverHelpers = require('../../server/helpers');
var portfinder = require('portfinder');

var distRequire = function(p) {
    return require(path.join(__dirname, '../../../dist/client/js/' + p));
};
var app;
var startedServer;

exports.serverRequire = serverHelpers.distRequire;
exports.require = distRequire;
exports.readableStream = serverHelpers.readableStream;
exports.startServer = function() {
    var usedHost = 'localhost';
    var usedPort;
    return apiHelpers.setUp().then(function(data) {
        app = data.app;
    }).then(function() {
        var defer = Q.defer();
        portfinder.getPort({
            host: usedHost,
            port: 40000
        }, function(err, port) {
            if(!err) {
                defer.resolve(port);
            } else {
                defer.reject(err);
            }
        });
        return defer.promise;
    }).then(function(port) {
        usedPort = port;
        var defer = Q.defer();
        startedServer = app.listen(port, usedHost, function(err) {
            if(!err) {
                defer.resolve();
            } else {
                defer.reject(err);
            }
        });
        return defer.promise;
    }).then(function() {
        return {
            app: app,
            server: startedServer,
            host: usedHost,
            port: usedPort
        };
    });
};
exports.stopServer = function() {
    var defer = Q.defer();
    if(app && app.emit) {
        app.emit('close');
    }
    if(startedServer && startedServer.close) {
        startedServer.close(defer.resolve);
    }
    return defer;
};
exports.emulateBrowser = function() {
    var wrtc = require('wrtc');
    var window = GLOBAL.window = GLOBAL;
    window.RTCPeerConnection = wrtc.RTCPeerConnection;
    window.RTCSessionDescription = wrtc.RTCSessionDescription;
    window.WebSocket = require('ws');
    require('blob-polyfill');

    ['warning', 'error', 'critical', 'info'].forEach(function(name) {
        if(!console[name]) {
            console[name] = function() {
                console.log.apply(this, arguments);
            };
        }
    });
};
exports.chai = serverHelpers.chai;
