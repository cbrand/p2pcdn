var Q = require('q');
var helpers = require('../../helpers');
var expect = helpers.chai.expect;

var messages = helpers.require('common/messages/message');
var InitClientNegotiation = messages.InitClientNegotiation;
var Orchestrator = helpers.require('channelOrchestrator/orchestrator');
var NegotiationOrchestrator = helpers.require('channelOrchestrator/orchestrator/negotiation');
var NegotiationHandler = helpers.require('channelOrchestrator/orchestrator/negotiation/handler');


describe('channel orchestrator', function() {

    describe('orchestrator', function() {

        describe('NegotiationOrchestrator', function() {
            var clientConnection;
            var otherClientConnection;
            var parentOrchestrator;

            beforeEach(function() {
                clientConnection = helpers.connectedChannels().handler;
                otherClientConnection = helpers.connectedChannels().handler;

                return helpers.getApp().then(function(app) {
                    parentOrchestrator = new Orchestrator(app);
                });
            });

            afterEach(function() {
                helpers.cleanUp();
            });

            describe('when creating a connection', function() {
                var negotiationOrchestrator;
                var initNegotiation;
                var negotiationId;

                beforeEach(function() {
                    negotiationOrchestrator = new NegotiationOrchestrator(parentOrchestrator);
                    return negotiationOrchestrator.create(clientConnection.left, otherClientConnection.left)
                        .then(function(neg) {
                            initNegotiation = neg;
                            negotiationId = initNegotiation.id;
                        });
                });

                it('should assign a new id when requesting a new negotiation', function() {
                    expect(initNegotiation).to.be.an.instanceof(InitClientNegotiation);
                    expect(initNegotiation).to.have.property('id');

                    var negotiationHandler = negotiationOrchestrator.get(negotiationId);
                    expect(negotiationHandler).to.be.an.instanceof(NegotiationHandler);
                });

                it('should remove the entry when the negotiation is released', function() {
                    var negotiationHandler = negotiationOrchestrator.get(negotiationId);
                    negotiationHandler.release();
                    expect(negotiationOrchestrator.get(negotiationId)).to.be.undefined;
                });

            });

        });

    });

});
