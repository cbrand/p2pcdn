var expect = require('chai').expect;
var Q = require('q');
var path = require('path');
var apiHelpers = require('../../server/test/http/api/helpers');
var serverHelpers = require('../../server/test/helpers');
var portfinder = require('portfinder');

var distRequire = function(p) {
    return require(path.join('../dist/js/' + p));
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
};
exports.shutdownWs = function(ws) {
    ws.close();
    var states = {
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3
    };

};
