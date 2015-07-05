var _ = require('underscore');
var Q = require('q');
var sinon = require('sinon');
var events = require('events');
var Encoder = require('text-encoding').TextEncoder;
var helpers = require('./helpers');
var expect = helpers.chai.expect;

var dbHelpers = require('./db/helpers');

var messages = require('messages/message');
var Orchestrator = require('orchestrator/orchestrator');
var ChannelWrapper = require('common/rtc/channelWrapper');


describe('Client: Orchestrator', function() {

    var rtcChannel;
    var serverRtcChannel;
    var orchestrator;
    var app;
    var receivedMessagesFromClient;
    var rtcCalleeChannel;
    var chunks = [
        'a', 'b', 'c', 'd', 'e'
    ];
    var b64chunks = dbHelpers.createBase64Chunks(chunks);

    var handleMessage = function(channel, message, exceptChunks) {
        exceptChunks = exceptChunks || [];
        var data;
        if(message instanceof messages.GetFileInfo) {
            data = new messages.FileInfo();
            data.uuid = message.uuid;
            data.name = 'test.txt';
            data.mimeType = 'plain/text';
            data.numChunks = 5;
            data.missingChunks = exceptChunks;
        } else if(message instanceof messages.GetChunk) {
            if(_.contains(exceptChunks, message.chunk)) {
                data = new messages.Error(messages.Error.Code.CHUNK_NOT_FOUND);
            } else {
                data = new messages.Chunk();
                data.uuid = message.uuid;
                data.chunk = message.chunk;
                data.data = new Encoder('utf8').encode(
                    new Blob(
                        [b64chunks[message.chunk]],
                        {
                            type: 'application/octet-stream'
                        }
                    )
                );
            }
        }
        if(data) {
            data.streamId = message.streamId;
            channel.send(data).done();
        }
    };

    beforeEach(function() {
        receivedMessagesFromClient = [];
        var connectedChannel = helpers.connectedChannels();
        rtcChannel = connectedChannel.handler.left;
        serverRtcChannel = connectedChannel.handler.right;
        rtcChannel.sendNotFound = false;
        serverRtcChannel.sendNotFound = false;

        app = new events.EventEmitter();

        rtcChannel.on('message', function(message) {
            receivedMessagesFromClient.push(message);
        });

        orchestrator = new Orchestrator(serverRtcChannel, app);

        sinon.stub(orchestrator, 'requestPeerConnection', function() {
            var peerConnectionChannel = helpers.connectedChannels();

            rtcCalleeChannel = peerConnectionChannel.handler.left;
            peerConnectionChannel.handler.right.on('message', function(message) {
                handleMessage(peerConnectionChannel.handler.right, message);
            });
            return Q(new ChannelWrapper(rtcCalleeChannel));
        });

    });

    afterEach(function() {
        return dbHelpers.truncate();
    });

    describe('requestFile', function() {

        var requestedUUID;

        beforeEach(function() {
            requestedUUID = 'abc-abc';

            rtcChannel.on('message', function(message) {
                handleMessage(rtcChannel, message);
            });
        });

        it('should be able to request data', function() {
            return orchestrator.requestFile(requestedUUID).then(function(file) {
                expect(file).to.have.property('id', requestedUUID);
                return expect(file.existingChunks()).to.eventually.deep.equal([0, 1, 2, 3, 4]);
            });
        });



    });

});
