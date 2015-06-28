/**
 * Server side negotiation for the WebRTC data channel connection.
 *
 * This is used from a client to initially connect to the api side.
 */

var NegotiationWs = require('./negotiation/ws');
var NegotiationHandler = require('./negotiation/handler');

export default function(ws, req) {
    var negotiationWs = new NegotiationWs(ws);
    new NegotiationHandler(negotiationWs, req.app.get('config'));
    negotiationWs.start();
};
