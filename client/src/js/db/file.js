var PouchDB = require('pouchdb');
var db = new PouchDB('files');


class File {

    constructor(id) {
        var self = this;
        self.id = id;
    }

    static load(id) {

    }

}

export default File;
