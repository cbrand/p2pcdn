var Q = require('q');
var fs = require('fs');
var wrtc = require('wrtc');
var temp = require('temp');
var path = require('path');

var helpers = require('../helpers');
var App = helpers.require('app');
var db = helpers.require('db');
var Config = helpers.require('config');
var Connection = helpers.require('rtc/connection');

var initConnection = function(serverConnection, clientConnection) {
    return Q.Promise(function (resolve, reject) {
        clientConnection.createOffer(function (clientDescriptor) {
            resolve(clientDescriptor);
        }, reject);
    }).then(function (clientDescriptor) {
        return Q.Promise(function (resolve, reject) {
            clientConnection.setLocalDescription(
                new wrtc.RTCSessionDescription(clientDescriptor),
                resolve.bind(undefined, clientDescriptor),
                reject
            );
        });
    }).then(function (clientDescriptor) {
        return serverConnection.setRemoteDescription(clientDescriptor);
    }).then(function () {
        return serverConnection.createAnswerAndSetLocalDescription();
    }).then(function (serverDescriptor) {
        return Q.Promise(function (resolve, reject) {
            clientConnection.setRemoteDescription(
                new wrtc.RTCSessionDescription(serverDescriptor),
                resolve.bind(undefined, serverDescriptor),
                reject
            );
        });
    }).then(function() {
        return [
            serverConnection,
            clientConnection
        ];
    });
};

var startConnection = function(app) {
    var serverConnection = new Connection(app);
    serverConnection.start();

    var clientConnection = new wrtc.RTCPeerConnection();
    clientConnection.onicecandidate = function (candidate) {
        if (!candidate.candidate) {
            return;
        }
        serverConnection.addIceCandidate(candidate.candidate);
    };
    serverConnection.on('icecandidate', function (candidate) {
        clientConnection.addIceCandidate(candidate);
    });
    var clientChannel = clientConnection.createDataChannel('p2pcdn');
    return initConnection(serverConnection, clientConnection).then(function(connections) {
        return {
            serverConnection: connections[0],
            clientConnection: connections[1],
            clientChannel: clientChannel
        };
    });
};

var createEventPromise = function (clientChannel, name) {
    return Q.Promise(function (resolve, reject) {
        clientChannel.addEventListener(name, function () {
            resolve();
        });
        clientChannel.addEventListener('error', function () {
            reject();
        });
    });
};

var bootUpConnection = function() {
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
    var app = new App(config);

    var connections;
    return db.sync().then(function () {
        return startConnection(app).then(function (c) {
            connections = c;
        });
    }).then(function () {
        return createEventPromise(connections.clientChannel, 'open');
    }).then(function() {
        return {
            app: app,
            config: config,
            directory: directory,
            fileDirectory: fileDirectory,
            serverConnection: connections.serverConnection,
            clientConnection: connections.clientConnection,
            clientChannel: connections.clientChannel
        };
    });
};

module.exports = {
    initConnection: initConnection,
    startConnection: startConnection,
    bootUpConnection: bootUpConnection,
    createEventPromise: createEventPromise
};
