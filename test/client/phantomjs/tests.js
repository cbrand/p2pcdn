require('es5-shim');
var Q = require('q');
Q.longStackSupport = true;
require('./orchestratorSpec');
require('./db/tests');
require('./rtc/tests');
require('../../common/tests');
