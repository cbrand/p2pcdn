/**
 * Express server handling the direct server communication.
 */

var express = require('express');
var app = exports.app = express();

app.use(express.static('client/dist'));
