/**
 * Main server component, which glues together the different
 * server specifications.
 */

var httpServer = require('./http/server');

var server = httpServer.app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('p2p cdn http://%s:%s', host, port);

});
