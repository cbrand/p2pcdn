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

exports.init = function(config) {
    app.set('fileHandler', new FileHandler(config));
    app.set('config', config);
};
