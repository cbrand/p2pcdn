var fs = require('fs');
var helpers = require('./helpers');
var Config = helpers.require('config');
var ini = require('ini');
var temp = require('temp');
var should = require('should');

describe('Config', function () {

    var exampleConfig;
    var tempDir;
    var writeConfigToFile = function () {
        exampleConfig = exampleConfig || {};
        var fd = temp.openSync({'suffix': '.ini'});
        var data = ini.encode(exampleConfig);
        fs.writeSync(fd.fd, data);
        return fd.path;
    };
    var initConfig = function () {
        var configPath = writeConfigToFile();
        var config = new Config(configPath);
        config.load();
        return config;
    };

    beforeEach(function () {
        temp.track();
        tempDir = temp.mkdirSync();
        exampleConfig = {
            fileDirectory: tempDir,
            database: {
                user: 'root',
                password: 'secret',
                host: 'localhost',
                port: 3307,
                type: 'mysql'
            }
        };
    });

    afterEach(function (done) {
        temp.cleanup(done);
    });

    it('should be able to parse a config file', function () {
        initConfig();
    });

    it('should return the configured directory for files', function () {
        var config = initConfig();
        config.fileDirectory.should.equal(tempDir);
    });

    describe('database', function () {

        var setSqlite = function () {
            exampleConfig.database.type = 'sqlite';
        };
        var getDbConfig = function () {
            return initConfig().database;
        };

        describe('type', function () {
            it('should fallback to sqlite if the type is unknown', function () {
                exampleConfig.database.type = 'special-sql';
                getDbConfig().type.should.equal('sqlite');
            });
        });

        describe('user', function () {
            it('should return if it is a network db', function () {
                getDbConfig().user.should.equal('root');
            });

            it('should nil if it is not a string', function () {
                exampleConfig.database.user = {};
                should.not.exist(getDbConfig().user);
            });

            it('should return nil if it is not a network database', function () {
                setSqlite();
                should.not.exist(getDbConfig().user);
            });
        });

        describe('password', function () {
            it('should return if it is a network db', function () {
                getDbConfig().password.should.equal('secret');
            });

            it('should nil if it is not a string', function () {
                exampleConfig.database.password = {};
                should.not.exist(getDbConfig().password);
            });

            it('should return nil if it is not a network database', function () {
                setSqlite();
                should.not.exist(getDbConfig().password);
            });
        });

        describe('host', function () {
            it('should return if it is a network db', function () {
                getDbConfig().host.should.equal('localhost');
            });

            it('should nil if it is not a string', function () {
                exampleConfig.database.host = {};
                should.not.exist(getDbConfig().host);
            });

            it('should return nil if it is not a network database', function () {
                setSqlite();
                should.not.exist(getDbConfig().host);
            });
        });

        describe('port', function () {
            it('should return if it is a network db', function () {
                getDbConfig().port.should.equal(3307);
            });

            it('should return the default value if nothing is passed', function () {
                exampleConfig.database.port = '';
                getDbConfig().port.should.equal(3306);
            });

            it('should return nil if it is not a network database', function () {
                setSqlite();
                should.not.exist(getDbConfig().port);
            });
        });

        describe('path', function () {
            it('should return null if it is a network database', function () {
                should.not.exist(getDbConfig().path);
            });

            it('should return the default path is none is provided but it is a non network database', function () {
                setSqlite();
                getDbConfig().path.should.equal('p2p-cdn.db');
            });

            it('should return the path if one is set and it is a sqlite database', function () {
                setSqlite();
                var sqlitePath = temp.path();
                exampleConfig.database.path = sqlitePath;

                getDbConfig().path.should.equal(sqlitePath);
            });
        });

        describe('with an empty configuration', function () {
            var config;

            beforeEach(function () {
                config = new Config();
            });

            it('should return an empty file directory', function () {
                should.not.exist(config.fileDirectory);
            });

            describe('database', function () {

                var getDatabase = function () {
                    return config.database;
                };

                it('should fallback to sqlite as a default entry', function () {
                    getDatabase().type.should.equal('sqlite');
                });

                it('should return an empty user', function () {
                    should.not.exist(getDatabase().user);
                });

                it('should return an empty password', function () {
                    should.not.exist(getDatabase().password);
                });

            });
        });

    });
});
