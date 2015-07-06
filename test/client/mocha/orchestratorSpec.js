var _ = require('underscore');
var Q = require('q');
var events = require('events');
var helpers = require('./helpers');
var expect = helpers.chai.expect;

helpers.emulateBrowser();

var messages = helpers.require('messages/message');
var Orchestrator = helpers.require('orchestrator/orchestrator');
var RTCCalleeConnectionHandler = helpers.require('rtc/connection/handler/throughRTC/callee');


describe('Client: Orchestrator', function() {
    var rtcChannel;
    var serverRtcChannel;
    var orchestrator;
    var rtcCalleeConnectionHandler;
    var negotiationId;
    var app;
    var receivedMessagesFromClient;
    var requestedFileID;
    var missingChunks;
    var rtcCalleeChannel;

    beforeEach(function() {
        requestedFileID = '1234567890';
        receivedMessagesFromClient = [];
        negotiationId = 'asdf-asdf-asdf';
        var connectedChannel = helpers.connectedChannels();
        rtcChannel = connectedChannel.handler.left;
        serverRtcChannel = connectedChannel.handler.right;
        rtcChannel.sendNotFound = false;
        serverRtcChannel.sendNotFound = false;

        app = new events.EventEmitter();

        rtcChannel.on('message', function(message) {
            receivedMessagesFromClient.push(message);
        });

        orchestrator = new Orchestrator(serverRtcChannel);

        missingChunks = [0, 1, 2];
    });

    var chunks = [
        'a', 'b', 'c', 'd', 'e'
    ];
    var handleMessage = function(channel, message) {
        if(message instanceof messages.GetFileInfo) {
            var fileInfo = new messages.FileInfo();
            fileInfo.uuid = message.uuid;
            fileInfo.name = 'test.txt';
            fileInfo.mimeType = 'plain/text';
            fileInfo.numChunks = 5;
            fileInfo.missingChunks = [];
            fileInfo.streamId = message.streamId;
            channel.send(fileInfo).done();
        } else if(message instanceof messages.GetChunk) {
            var chunk = new messages.Chunk();
            chunk.uuid = message.uuid;
            chunk.chunk = message.chunk;
            chunk.data = new Buffer(chunks[message.chunk]);
            chunk.streamId = message.streamId;
            channel.send(chunk).done();
        }
    };
    var prepareForClientConnectionResolve = function() {
        rtcChannel.on('message', function(message) {
            if(message instanceof messages.GetPeerFor || message instanceof messages.RequestPeersFor) {
                var initClientConnection = new messages.InitClientNegotiation(negotiationId);
                initClientConnection.streamId = message.streamId;
                rtcChannel.send(initClientConnection);
                receivedMessagesFromClient = _.without(receivedMessagesFromClient, message);
            }
        });

        rtcChannel.on('new_rtc_offer', function(data) {
            rtcCalleeConnectionHandler = new RTCCalleeConnectionHandler(
                rtcChannel,
                negotiationId,
                data.offer,
                app
            );
            rtcCalleeConnectionHandler.connect().then(function(channel) {
                rtcCalleeChannel = channel;
                rtcCalleeChannel.on('message', function(message) {
                    handleMessage(rtcCalleeChannel, message);
                });
                return channel;
            });
        });
    };

    describe('requestPeerConnection', function() {

        it('should request valid peers of a file', function() {
            orchestrator.requestPeerConnection(requestedFileID, missingChunks);
            return Q().delay(10).then(function() {
                expect(receivedMessagesFromClient).to.have.length.of.at.least(1);
                var message = receivedMessagesFromClient[0];
                expect(message).to.be.instanceof(messages.GetPeerFor);
                expect(message.UUID).to.equal(requestedFileID);
                expect(message.neededChunks).to.deep.equal(missingChunks);
            });
        });

        describe('after requesting a peer for a file', function() {

            beforeEach(prepareForClientConnectionResolve);

            it('should connect to a channel', function() {
                return orchestrator.requestPeerConnection(requestedFileID, missingChunks).then(function(channel) {
                    expect(channel).to.be.ok;
                    channel.close();
                });
            });

        });

    });

    describe('requestPeerConnections', function() {

        beforeEach(prepareForClientConnectionResolve);

        it('should connect to a channel', function() {
            this.timeout(5000);
            var emitter = orchestrator.requestPeerConnections(requestedFileID, missingChunks);

            return Q.Promise(function(resolve) {
                emitter.on('connection', function(channel) {
                    expect(channel).to.be.ok;
                    channel.close();
                    resolve();
                });
            });
        });

    });

});
