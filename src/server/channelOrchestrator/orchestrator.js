var Q = require('q');
var Connection = require('./channel/wrapper');


class Orchestrator {
    constructor(app) {
        var self = this;
        self.app = app;
        self.connections = [];
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.app.on('datachannel', function(dataChannel) {
            self.emit('connection', new Connection(dataChannel));
        });
        self.on('connection', self.onConnection.bind(self));
    }

    onConnection(connection) {
        var self = this;
        self.connections.push(connection);
    }

    requestPeersWithCompleteFiles(UUID) {
        var self = this;
        self.connections.forEach(function(connection) {
            connection.hasCompleteFile(UUID).then(function(hasCompleteFile) {
                if(hasCompleteFile) {
                    self.emit('connection-complete-peer', {
                        connection: connection,
                        UUID: UUID
                    });
                }
            });
        });
    }
}

export default Orchestrator;
