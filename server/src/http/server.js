/**
 * Express server handling the direct server communication.
 */

var express = require('express'),
    app = exports.app = express();

app.use(express.static('client/dist'));
