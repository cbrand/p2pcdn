var helpers = require('../helpers');
var expect = helpers.chai.expect;

var messages;
if(helpers.isNode) {
    messages = helpers.require('common/messages/message');
} else {
    messages = require('common/messages/message');
}
var Message = messages.Message;
var FileInfo = messages.FileInfo;


describe('Messages', function() {

    describe('FileInfo', function() {

        describe('when having a fileInfo object', function() {
            var fileInfo;

            beforeEach(function() {
                fileInfo = new FileInfo('abc');
                fileInfo.name = 'test.txt';
                fileInfo.mimeType = 'plain/text';
                fileInfo.numChunks = 6;
                fileInfo.missingChunks = [0, 1, 2];
            });

            it('should be initialized with the uuid', function() {
                expect(fileInfo.uuid).to.equal('abc');
            });

            it('should correctly calculate the existing chunks', function() {
                expect(fileInfo.existingChunks).to.deep.equal([3, 4, 5]);
            });

            describe('when serializing and deserializing the message', function() {
                var deserializedFileInfo;

                beforeEach(function() {
                    return fileInfo.serialize().then(function(fileInfoBytes) {
                        return Message.deserialize(fileInfoBytes);
                    }).then(function(fInfo) {
                        deserializedFileInfo = fInfo;
                    });
                });

                it('should correctly set the uuid', function() {
                    expect(deserializedFileInfo.uuid).to.equal('abc');
                });

                it('should correctly set the file name', function() {
                    expect(deserializedFileInfo.name).to.equal('test.txt');
                });

                it('should correctly set the numChunks', function() {
                    expect(deserializedFileInfo.numChunks).to.equal(6);
                });

                it('should correctly set the missingChunks', function() {
                    expect(deserializedFileInfo.missingChunks).to.deep.equal([0, 1, 2]);
                });
            });
        });

    });

});
