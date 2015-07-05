/**
 * Manually importing the dependencies here, it can not be parsed
 * by browserify.
 */

window.isNode = false;
require('./rtc/tests');
require('./messages/tests');
