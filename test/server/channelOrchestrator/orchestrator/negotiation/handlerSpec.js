var Q = require('q');
var events = require('events');
var helpers = require('../../../helpers');
var expect = helpers.chai.expect;

var messages = helpers.require('common/messages/message');
var ClientNegotiation = messages.ClientNegotiation;
var NegotiationHandler = helpers.require('channelOrchestrator/orchestrator/negotiation/handler');


describe('channel orchestrator', function() {

    describe('orchestrator', function() {

        describe('NegotiationOrchestrator', function() {

            describe('NegotiationHandler', function() {
                var firstClientChannel;
                var secondClientChannel;
                var firstClientSendChannel;
                var secondClientSendChannel;

                var negotiationHandler;
                var negotiationId = 'asdf-asdf-asdf';


                beforeEach(function() {
                    firstClientChannel = helpers.connectedChannels();
                    secondClientChannel = helpers.connectedChannels();

                    negotiationHandler = new NegotiationHandler(
                        firstClientChannel.handler.right,
                        secondClientChannel.handler.right
                    );

                    firstClientSendChannel = firstClientChannel.handler.left;
                    secondClientSendChannel = secondClientChannel.handler.left;
                });

                afterEach(function() {
                    negotiationHandler.release();
                    helpers.cleanUp();
                });

                it('should return an initialization message when initiating', function() {
                    var result = negotiationHandler.init(negotiationId);
                    expect(result).to.be.an.instanceof(messages.InitClientNegotiation);
                    expect(result).to.have.property('id', negotiationId);
                });

                var getNegotiation = function(negId) {
                    var clientNegotiation = new ClientNegotiation(negId);
                    clientNegotiation.negotiationType = ClientNegotiation.NegotiationType.ICE_CANDIDATE;
                    return clientNegotiation;
                };

                describe('after initialization', function() {
                    var emitter;

                    beforeEach(function() {
                        negotiationHandler.init(negotiationId);
                        emitter = new events.EventEmitter();
                    });

                    describe('when sending from client 1 to client 2', function() {
                        var sendChannel;
                        var messagesReceived;

                        beforeEach(function() {
                            messagesReceived = [];
                            sendChannel = firstClientSendChannel;

                            secondClientSendChannel.on('message', function(message) {
                                messagesReceived.push(message);
                                emitter.emit('message', message);
                            });
                        });

                        it('should not relay any non negotiation messages', function() {
                            var initMessage = new messages.Init();
                            return sendChannel.send(initMessage).delay(10).then(function() {
                                expect(messagesReceived).to.have.length(0);
                            });
                        });

                        it('should not relay client negotiation messages with different negotiation ids', function() {
                            var clientNegotiation = getNegotiation('not-my-negotiationId');
                            return sendChannel.send(clientNegotiation).delay(10).then(function() {
                                expect(messagesReceived).to.have.length(0);
                            });
                        });

                        it('should relay client negotiation messages with same negotiation ids', function() {
                            var clientNegotiation = new getNegotiation(negotiationId);
                            return sendChannel.send(clientNegotiation).delay(10).then(function() {
                                expect(messagesReceived).to.have.length(1);
                            });
                        });

                        it('should not relay data if the handler has been cleaned up', function() {
                            var clientNegotiation = new getNegotiation(negotiationId);
                            negotiationHandler.release();

                            return sendChannel.send(clientNegotiation).delay(10).then(function() {
                                expect(messagesReceived).to.have.length(0);
                            });
                        });
                    });

                    describe('when sending from client 2 to client 1', function() {
                        var sendChannel;
                        var messagesReceived;

                        beforeEach(function() {
                            messagesReceived = [];
                            sendChannel = secondClientSendChannel;

                            firstClientSendChannel.on('message', function(message) {
                                messagesReceived.push(message);
                                emitter.emit('message', message);
                            });
                        });

                        var expectMessage = function() {
                            var defer = Q.defer();
                            emitter.once('message', function(message) {
                                setTimeout(function() {
                                    defer.resolve(message);
                                }, 0);
                            });
                            return defer.promise;
                        };

                        it('should not relay any non negotiation messages', function() {
                            var initMessage = new messages.Init();
                            return sendChannel.send(initMessage).delay(10).then(function() {
                                expect(messagesReceived).to.have.length(0);
                            });
                        });

                        it('should not relay client negotiation messages with different negotiation ids', function() {
                            var clientNegotiation = getNegotiation('not-my-negotiationId');
                            return sendChannel.send(clientNegotiation).delay(10).then(function() {
                                expect(messagesReceived).to.have.length(0);
                            });
                        });

                        it('should relay client negotiation messages with same negotiation ids', function() {
                            var clientNegotiation = new getNegotiation(negotiationId);
                            var onMessage = expectMessage();
                            return sendChannel.send(clientNegotiation).thenResolve(onMessage).then(function() {
                                expect(messagesReceived).to.have.length(1);
                            });
                        });
                    });
                });
            });

        });

    });

});
