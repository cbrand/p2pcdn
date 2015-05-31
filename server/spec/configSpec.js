
var fs = require('fs');
var Config = require('../dist/config');
var ini = require('ini');
var temp = require('temp');
var mockery = require('mockery');

describe('Config', function() {

    var exampleConfig;
    var tempDir;
    var writeConfigToFile = function() {
        exampleConfig = exampleConfig || {};
        var fd = temp.openSync({'suffix': '.ini'});
        var data = ini.encode(exampleConfig);
        fs.writeSync(fd.fd, data);
        return fd.path;
    };
    var initConfig = function() {
        var configPath = writeConfigToFile();
        var config = new Config(configPath);
        config.load();
        return config;
    };

    beforeEach(function() {
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

    afterEach(function(cb) {
        temp.cleanup(cb);
    });

    it('should be able to parse a config file', function() {
        initConfig();
    });

    it('should return the configured directory for files', function() {
        var config = initConfig();
        expect(config.fileDirectory).toEqual(tempDir);
    });

    describe('database', function() {

        var setSqlite = function() {
            exampleConfig.database.type = 'sqlite';
        };
        var getDbConfig = function() {
            return initConfig().database;
        };

        describe('user', function() {
            it('should return if it is a network db', function() {
                expect(getDbConfig().user).toEqual('root');
            });

            it('should nil if it is not a string', function() {
                exampleConfig.database.user = {};
                expect(getDbConfig().user).toBeNull();
            });

            it('should return nil if it is not a network database', function() {
                setSqlite();
                expect(getDbConfig().user).toBeNull();
            });
        });

        describe('password', function() {
            it('should return if it is a network db', function() {
                expect(getDbConfig().password).toEqual('secret');
            });

            it('should nil if it is not a string', function() {
                exampleConfig.database.password = {};
                expect(getDbConfig().password).toBeNull();
            });

            it('should return nil if it is not a network database', function() {
                setSqlite();
                expect(getDbConfig().password).toBeNull();
            });
        });

        describe('host', function() {
            it('should return if it is a network db', function() {
                expect(getDbConfig().host).toEqual('localhost');
            });

            it('should nil if it is not a string', function() {
                exampleConfig.database.host = {};
                expect(getDbConfig().host).toBeNull();
            });

            it('should return nil if it is not a network database', function() {
                setSqlite();
                expect(getDbConfig().host).toBeNull();
            });
        });

        describe('port', function() {
            it('should return if it is a network db', function() {
                expect(getDbConfig().port).toEqual(3307);
            });

            it('should return the default value if nothing is passed', function() {
                exampleConfig.database.port = "";
                expect(getDbConfig().port).toEqual(3306);
            });

            it('should return nil if it is not a network database', function() {
                setSqlite();
                expect(getDbConfig().port).toBeNull();
            });
        });

        describe('path', function() {
            it('should return null if it is a network database', function() {
                expect(getDbConfig().path).toBeNull();
            });

            it('should return the default path is none is provided but it is a non network database', function() {
                setSqlite();
                expect(getDbConfig().path).toEqual('p2p-cdn.db');
            });

            it('should return the path if one is set and it is a sqlite database', function() {
                setSqlite();
                var sqlitePath = temp.path();
                exampleConfig.database.path = sqlitePath;

                expect(getDbConfig().path).toEqual(sqlitePath);
            });
        });

        describe('with an empty configuration', function() {
            var config;

            beforeEach(function() {
                config = new Config();
            });

            it ('should return an empty file directory', function() {
                expect(config.fileDirectory).toBeNull();
            });

            describe('database', function() {

                var getDatabase = function() {
                    return config.database;
                };

                it('should fallback to sqlite as a default entry', function() {
                    expect(getDatabase().type).toEqual('sqlite');
                });

                it('should return an empty user', function() {
                    expect(getDatabase().user).toBeNull();
                });

                it('should return an empty password', function() {
                    expect(getDatabase().password).toBeNull();
                });

            });
        });

    });
});
