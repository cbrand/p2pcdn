var express = require('express');
var expressWs = require('express-ws');
var HttpStatus = require('http-status-codes');
var filesRouter = require('./api/files');

var api = express.Router();

api.use('/files', filesRouter);

export default api;
