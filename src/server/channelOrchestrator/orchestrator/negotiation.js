var Q = require('q');
var crypto = require('crypto');
var pseudoRandomBytes = Q.denodeify(crypto.pseudoRandomBytes);

var NegotiationHandler = require('./negotiation/handler');
var BaseOrchestrator = require('./base');


class NegotiationOrchestrator extends BaseOrchestrator {

    constructor(parentOrchestrator) {
        super(parentOrchestrator);
        var self = this;
        self.negotiations = {};
    }

    _newNegotiationId() {
        var self = this;
        var shasum = crypto.createHash('sha256');
        shasum.update(new Date().toString());
        return pseudoRandomBytes(256).then(function(randomBytes) {
            shasum.update(randomBytes);
            return shasum.digest('hex');
        }).then(function(negotiationId) {
            /* this is very hard to test. Thus ignoring it */
            /* istanbul ignore if */
            if(self.negotiations[negotiationId]) {
                return self._newNegotiationId();
            } else {
                // Reserving the slot.
                self.negotiations[negotiationId] = {};
                return negotiationId;
            }
        });

    }

    create(fromPeer, peer) {
        var self = this;
        var negotiations = self.negotiations;

        return self._newNegotiationId().then(function(negotiationId) {
            var negotiation = negotiations[negotiationId] =
                new NegotiationHandler(fromPeer, peer);

            var result = negotiation.init(negotiationId);
            self.negotiations[negotiationId] = negotiation;
            negotiation.once('release', function() {
                delete self.negotiations[negotiationId];
            });

            return result;
        });
    }

    get(negotiationId) {
        var self = this;
        return self.negotiations[negotiationId];
    }

}

export default NegotiationOrchestrator;
