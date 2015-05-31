/**
 * Main server component, which glues together the different
 * server specifications.
 */

var fs = require('fs');
var path = require('path');
var console = require('console');
var argumentParser = require("node-argument-parser");

var httpServer = require('./http/server');
var Config = require('./config');

var CONFIG;

var parseCommandLine = function() {
    var argumentsPath = path.resolve(__dirname, 'arguments.json');
    return argumentParser.parse(argumentsPath, process);
};

var commands = {
    init_db: function() {

    },
    run_server: function() {
        var server = httpServer.app.listen(3000, function () {

            var host = server.address().address;
            var port = server.address().port;

            console.log('p2p cdn http://%s:%s', host, port);

        });
    }
};

var main = function() {
    var argv = parseCommandLine();
    CONFIG = new Config(argv.config);

    if (fs.exists(argv.config)) {
        CONFIG.load();
    }

    var run = false;
    if (argv['init-db']) {
        commands.init_db(argv);
        run = true;
    }
    if (argv['run-server']) {
        commands.run_server(argv);
        run = true;
    }

    if(!run) {
        console.log("No actions given. Doing nothing.");
    }
};

exports.main = main;
