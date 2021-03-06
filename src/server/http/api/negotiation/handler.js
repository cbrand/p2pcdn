var events = require('events');
var Connection = require('../../../rtc/connection');
var Negotiation = require('./negotiation');

class NegotiationHandler extends events.EventEmitter {

    constructor(ws, app) {
        super();
        var self = this;
        self.ws = ws;
        self.initEvents();
        self.app = app;
        self.connection = null;
    }

    initEvents() {
        var self = this;
        self.on('message', self.handleMessage.bind(self));
        self.ws.on('message', self.newMessage.bind(self));

        self.on('newOffer', self.handleOffer.bind(self));
        self.on('newICECandidate', self.handleICECandidate.bind(self));
    }

    newMessage(negotiation) {
        var self = this;
        self.emit('message', negotiation);
    }

    handleMessage(negotiation) {
        var self = this;
        switch(negotiation.type) {
            case Negotiation.Type.OFFER:
                self.emit('newOffer', negotiation);
                break;
            case Negotiation.Type.ICE_CANDIDATE:
                self.emit('newICECandidate', negotiation);
                break;
            default:
                throw new Error('Unkown message');
        }
    }

    newConnection() {
        var self = this;
        if(self.connection && self.connection.close) {
            // Cleanup dangling ones.
            self.connection.close();
        }
        self.connection = new Connection(self.app);
        self.connection.on('icecandidate', self.sendICECandidate.bind(self));
        self.connection.on('datachannelhandler', self.sendDataChannelHandler.bind(self));
    }

    handleOffer(negotiation) {
        var self = this;
        self.newConnection();

        self.connection.setRemoteDescription(negotiation.payload);
        self.connection.createAnswerAndSetLocalDescription().then(function(response) {
            return self.sendResponse(response);
        }).done();
    }

    handleICECandidate(negotiation) {
        var self = this;
        self.connection.addIceCandidate(negotiation.payload);
    }

    sendICECandidate(candidate) {
        var self = this;
        var negotiation = new Negotiation();
        negotiation.type = Negotiation.Type.ICE_CANDIDATE;
        negotiation.payload = candidate;
        return self.ws.send(negotiation);
    }

    sendResponse(serverDescriptor) {
        var self = this;
        var negotiation = new Negotiation();
        negotiation.type = Negotiation.Type.OFFER_RESPONSE;
        negotiation.payload = serverDescriptor;
        return self.ws.send(negotiation);
    }

    close() {
        var self = this;
        self.connection && self.connection.close();
    }

    sendDataChannelHandler(dataChannelHandler) {
        var self = this;
        self.app.trigger('datachannel', dataChannelHandler);
    }
}

export default NegotiationHandler;
