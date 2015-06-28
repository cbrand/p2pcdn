/**
 * Main server component, which glues together the different
 * server specifications.
 */

var fs = require('fs');
var path = require('path');
var console = require('console');
var argumentParser = require('node-argument-parser');
var db = require('./db');

var httpServer = require('./http/server');
var Config = require('./config');

var CONFIG;

var parseCommandLine = function () {
    var argumentsPath = path.resolve(__dirname, 'arguments.json');
    return argumentParser.parse(argumentsPath, process);
};

var commands = {
    initDb: function () {
        db.sync().then(function() {
            console.log('Database synced');
        });
    },
    runServer: function () {
        var server = httpServer.app.listen(3000, function () {

            var host = server.address().address;
            var port = server.address().port;

            console.log('p2p cdn http://%s:%s', host, port);

        });
    }
};

var main = function () {
    var argv = parseCommandLine();
    CONFIG = new Config(argv.config);

    if (fs.exists(argv.config)) {
        CONFIG.load();
    }

    if (argv['init-db']) {
        commands.initDb(argv).then(function () {
            console.log('Database initialized.');
        });
        return;
    }
    if (argv['run-server']) {
        commands.runServer(argv);
        return;
    }

    if (!argv.help) {
        console.log('No actions given. Doing nothing.');
    }
};

exports.main = main;
