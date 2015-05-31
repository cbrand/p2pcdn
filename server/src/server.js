/**
 * Main server component, which glues together the different
 * server specifications.
 */

var httpServer = require('./http/server');
var argumentParser = require("node-argument-parser");
var path = require('path');

var argumentsPath = path.resolve(__dirname, 'arguments.json');
var argv = argumentParser.parse(argumentsPath, process);
var console = require('console');

if(!argv.help) {
    var server = httpServer.app.listen(3000, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('p2p cdn http://%s:%s', host, port);

    });
}
