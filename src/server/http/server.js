/**
 * Express server handling the direct server communication.
 */

var express = require('express');
var expressWs = require('express-ws');
var FileHandler = require('../handlers/file');
var apiRouter = require('./api');
var negotiationHandler = require('./api/negotiation');

var app = exports.app = express();
expressWs(app);

app.use(express.static('client/dist'));

app.ws('/api/rtc-negotiation', negotiationHandler);
app.use('/api', apiRouter);

exports.init = function(p2pApp) {
    var config = p2pApp.config;
    app.set('fileHandler', new FileHandler(config));
    app.set('config', config);
    app.set('app', p2pApp);
};
