/**
 * Express server handling the direct server communication.
 */

var express = require('express');
var FileHandler = require('../handlers/file');
var apiRouter = require('./api');

var app = exports.app = express();

app.use(express.static('client/dist'));

app.use('/api', apiRouter);

exports.init = function(config) {
    app.set('fileHandler', new FileHandler(config));
    app.set('config', config);
};
