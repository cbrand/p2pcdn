var express = require('express');
var filesRouter = require('./api/files');

var api = express.Router();

api.use('/files', filesRouter);

export default api;
