var events = require('events');
var ChannelWrapper = require('./channel/wrapper');


class Connection extends events.EventEmitter {

    constructor(dataChannel) {
        super();
        var self = this;
        self.channel = new ChannelWrapper(dataChannel);
    }

    /**
     * hasCompleteFile returns if the passed fileUUID is
     * completetly existing on the remote peer.
     *
     * @param fileUUID {string}
     * @returns {Promise.<boolean>}
     */
    hasCompleteFile(fileUUID) {
        var self = this;
        return self.channel.requestFileInfo(fileUUID).then(function(fileInfo) {
            return fileInfo.missingChunks.length === 0;
        });
    }

}

export default Connection;
