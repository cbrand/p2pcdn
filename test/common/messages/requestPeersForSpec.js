var helpers = require('../helpers');
var expect = helpers.chai.expect;

var messages;
if(helpers.isNode) {
    messages = helpers.require('common/messages/message');
} else {
    messages = require('common/messages/message');
}
var Message = messages.Message;
var RequestPeersFor = messages.RequestPeersFor;


describe('Messages', function() {

    describe('RequestPeersFor', function() {

        describe('when having a fileInfo object', function() {
            var requestPeersFor;

            beforeEach(function() {
                requestPeersFor = new RequestPeersFor(
                    'abc-abc',
                    [0, 1, 2, 3, 4]
                );
                requestPeersFor.numPeers = 20;
            });

            describe('when serializing and deseriliazing', function() {

                beforeEach(function() {
                    return requestPeersFor.serialize().then(function(data) {
                        return Message.deserialize(data);
                    }).then(function(item) {
                        requestPeersFor = item;
                    });
                });

                it('should have the correct uuid', function() {
                    expect(requestPeersFor).to.have.property('uuid', 'abc-abc');
                });

                it('should have the correct wanted chunks', function() {
                    expect(requestPeersFor.neededChunks).to.deep.equal([0, 1, 2, 3, 4]);
                });

                it('should have the correct number of peers', function() {
                    expect(requestPeersFor).to.have.property('numPeers', 20);
                });

            });


        });

    });

});
