var _ = require('underscore');
var events = require('events');
var Connection = require('./connection');


class Connections extends events.EventEmitter {

    constructor(app) {
        super();
        var self = this;
        self.app = app;
        self.connections = [];
        self.forEach = self.connections.forEach.bind(self.connections);
        self._initEvents();
    }

    _initEvents() {
        var self = this;
        self.app.on('datachannel', function (dataChannel) {
            self.emit('connection', new Connection(dataChannel));
        });
        self.on('connection', self.onConnection.bind(self));
    }

    onConnection(connection) {
        var self = this;
        self.connections.push(connection);
        connection.once('close', function() {
            self.connections = _.without(self.connections, connection);
        });
        return connection;
    }

}

export default Connections;
