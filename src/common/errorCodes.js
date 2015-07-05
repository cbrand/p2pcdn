var _ = require('underscore');
var messages = require('./messages/message');

export default _.extend({}, messages.Error.Code, {
    Q_TIMEOUT: 'ETIMEDOUT'
});
