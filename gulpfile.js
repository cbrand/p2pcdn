'use strict';

var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var browserifyIstanbul = require('browserify-istanbul');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var babel = require('gulp-babel');
// var less = require('gulp-less');
var concatCss = require('gulp-concat-css');
var sourcemaps = require('gulp-sourcemaps');
var server = require('gulp-express');
var replace = require('gulp-replace');
var mocha = require('gulp-mocha');
var gulpprotobuf = require('gulp-protobufjs');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var istanbulReport = require('gulp-istanbul-report');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

var browserifyPaths = [dirs.dist + '/js', './node_modules'];

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ], done);
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:license',
    'copy:material.css',
    'copy:material.fonts',
    'copy:material.js',
    'copy:main.css',
    'copy:misc',
    'copy:normalize'
]);

gulp.task('concat', [
    'concat:css'
]);

gulp.task('copy:server', [
    'copy:server:json'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
        .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
        .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
        .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:license', function () {
    return gulp.src('LICENSE.txt')
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
        ' | ' + pkg.license.type + ' License' +
        ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
        .pipe(plugins.header(banner))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
            cascade: false
        }))
        .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:material.css', function () {
    var MATERIAL_DIR = dirs.bower + '/bootstrap-material-design/dist/css/';
    return gulp.src([
        MATERIAL_DIR + 'material-fullpalette.min.css',
        MATERIAL_DIR + 'roboto.min.css',
        MATERIAL_DIR + 'ripples.min.css'
    ]).pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:material.fonts', function () {
    var MATERIAL_DIR = dirs.bower + '/bootstrap-material-design/dist/fonts/';
    return gulp.src(MATERIAL_DIR + '*').pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:material.js', function () {
    var MATERIAL_DIR = dirs.bower + '/bootstrap-material-design/dist/js/';
    return gulp.src([
        MATERIAL_DIR + 'material.min.js',
        MATERIAL_DIR + 'ripples.min.js'
    ]).pipe(gulp.dest(dirs.dist + '/js'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/js/**/*',
        '!' + dirs.src + '/less/**/*',
        '!' + dirs.src + '/index.html'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
        .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:server:json', function () {
    return gulp.src(dirs.server + '/**/*.json')
        .pipe(gulp.dest(dirs.serverDist));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/**/*.js',
        '!' + dirs.src + '/js/vendor/**/*.js',
        dirs.test + '/**/*.js',
        dirs.server + '/**/*.js',
        dirs.serverTest + '/**/*.js'
    ]).pipe(plugins.eslint({
        useEslintrc: true
    }))
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failOnError());
});

gulp.task('lint:js:report', function() {
    mkdirp('testresults');
    var reportFile = fs.createWriteStream('testresults/lint-checkstyle.xml');
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/**/*.js',
        '!' + dirs.src + '/js/vendor/**/*.js',
        dirs.test + '/**/*.js',
        dirs.server + '/**/*.js',
        dirs.serverTest + '/**/*.js'
    ]).pipe(plugins.eslint({
        useEslintrc: true
    }))
        .pipe(plugins.eslint.format('checkstyle', reportFile))
        .on('finish', function() {
            reportFile.close();
        });
});

gulp.task('browserify:client', function () {
    gulp.src(dirs.dist + '/js/main.js')
        .pipe(plugins.browserify({
            insertGlobals: true,
            debug: true,
            paths: browserifyPaths,
            transform: ['stringify'],
            ignore: ['wrtc']
        }))
        .pipe(gulp.dest(dirs.dist + '/js/bundle'));
});

gulp.task('concat:css', function () {
    return gulp.src([
        dirs.dist + '/css/normalize.css',
        dirs.dist + '/css/material-fullpalette.min.css',
        dirs.dist + '/css/roboto.min.css',
        dirs.dist + '/css/ripples.min.css',
        dirs.dist + '/css/main.css'
    ])
        .pipe(concatCss('css/bundle.css'))
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('compile:client', function () {
    return gulp.src(dirs.src + '/**/*.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel())
        .pipe(replace(/(var _createClass =[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(function _classCallCheck\(instance, Constructor\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(function _inherits\(subClass, superClass\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(var _get = function get\(_x, _x2, _x3\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('compile:server', function () {
    return gulp.src(dirs.server + '/**/*.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel())
        .pipe(replace(/(var _createClass =[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(function _classCallCheck\(instance, Constructor\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(function _inherits\(subClass, superClass\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(var _get = function get\(_x, _x2, _x3\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.serverDist));
});

var browserifyTestPaths = browserifyPaths.concat([dirs.phantomTest]);
gulp.task('browserify:client:tests', function () {
    return browserify({
        entries: [dirs.phantomTest + '/tests.js'],
        debug: true,
        paths: browserifyTestPaths
    })
        .bundle()
        .pipe(source('tests.js'))
        .pipe(buffer())
        .pipe(gulp.dest(dirs.phantomTest + '/compiled'));
});

gulp.task('browserify:client:tests:istanbul', function () {
    return browserify({
        entries: [dirs.phantomTest + '/tests.js'],
        debug: true,
        paths: browserifyTestPaths
    })
        .transform(browserifyIstanbul())
        .bundle()
        .pipe(source('tests.js'))
        .pipe(buffer())
        .pipe(gulp.dest(dirs.phantomTest + '/compiled'));
});

gulp.task('compile:protobuf', function () {
    return gulp.src(dirs.common + '/**/*.proto')
        .pipe(gulpprotobuf({
            target: 'json'
        }))
        .pipe(plugins.rename({
            dirname: dirs.commonDist + '/messages/definitions',
            extname: '.json'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('compile:common', function() {
    return gulp.src(dirs.common + '/**/*.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel())
        .pipe(replace(/(var _createClass =[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(function _classCallCheck\(instance, Constructor\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(function _inherits\(subClass, superClass\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(replace(/(var _get = function get\(_x, _x2, _x3\)[^\n]*)/, '/* istanbul ignore next */ $1'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.commonDist));
});

gulp.task('mocha:run:console:node', function () {
    return gulp.src([
        dirs.test + '/**/*.js',
        dirs.serverTest + '/**/*.js'
    ]).pipe(mocha());
});

gulp.task('mocha:run:console:phantomjs', function () {
    return gulp.src(dirs.phantomTest + '/runner.html')
        .pipe(mochaPhantomJS());
});

gulp.task('mocha:run:console', function (done) {
    runSequence(
        'mocha:run:console:node',
        'mocha:run:console:phantomjs',
        done);
});

gulp.task('mocha:run:junit:node', function (done) {
    mkdirp('testresults');
    gulp.src([
        dirs.dist + '/js/**/*.js',
        '!' + dirs.dist + '/js/vendor/**/*.js',
        dirs.serverDist + '/**/*.js'
    ])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            return gulp.src([
                dirs.serverTest + '/**/*.js',
                dirs.test + '/**/*.js'
            ])
                .pipe(mocha({
                    reporter: 'xunit',
                    reporterOptions: {
                        output: 'testresults/xunit-server.xml'
                    }
                }))
                .pipe(istanbul.writeReports({
                    dir: './coverage/temp',
                    reporters: ['json']
                }))
                .on('end', done)
                ;
        });
});

gulp.task('mocha:run:junit:phantomjs', function (done) {
    mkdirp('testresults');
    require('del')([
        'testresults/xunit-client.xml'
    ], function() {
        return gulp.src(dirs.phantomTest + '/runner.html')
            .pipe(mochaPhantomJS({
                phantomjs: {
                    hooks: 'mocha-phantomjs-istanbul',
                    coverageFile: './coverage/temp/coverage-client.json'
                },
                reporter: 'xunit',
                dump: 'testresults/xunit-client.xml'
            })).on('finish', done);
    });
});

gulp.task('mocha:run:junit', function (done) {
    runSequence(
        'mocha:run:junit:node',
        'mocha:run:junit:phantomjs',
        'mocha:coverage:create',
        done);
});

gulp.task('mocha:junit', function (done) {
    runSequence(
        'build:server',
        'build:tests:coverage',
        'mocha:run:junit',
        done);
});

gulp.task('mocha:console', function (done) {
    runSequence(
        'build:server',
        'build:tests',
        'mocha:run:console',
        done);
});

gulp.task('mocha:coverage:node', function (done) {
    gulp.src([
        dirs.dist + '/js/**/*.js',
        '!' + dirs.dist + '/js/vendor/**/*.js',
        dirs.serverDist + '/**/*.js'
    ])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src([
                dirs.test + '/**/*.js',
                dirs.serverTest + '/**/*.js'
            ])
                .pipe(mocha())
                .pipe(istanbul.writeReports({
                    dir: './coverage/temp',
                    reporters: ['json']
                }))
                .on('end', done)
            ;
        });
});

gulp.task('mocha:coverage:phantomjs', function () {
    return gulp.src(dirs.phantomTest + '/runner.html')
        .pipe(mochaPhantomJS({
            phantomjs: {
                hooks: 'mocha-phantomjs-istanbul',
                coverageFile: './coverage/temp/coverage-client.json'
            },
            reporter: 'spec'
        }));
});

gulp.task('mocha:coverage:print', function () {
    gulp.src([
        'coverage/temp/coverage-*.json'
    ]).pipe(istanbulReport());
});

gulp.task('mocha:coverage', function (done) {
    runSequence(
        'build:tests:coverage',
        'mocha:coverage:node',
        'mocha:coverage:phantomjs',
        'mocha:coverage:print',
        done);
});

gulp.task('mocha:coverage:create', function () {
    gulp.src([
        'coverage/temp/coverage-*.json'
    ]).pipe(istanbulReport({
        dir: './coverage',
        reporters: ['html', 'cobertura']
    }));
});

gulp.task('run:server', function () {
    server.run(['server/src/server.js']);

    gulp.watch([
        'client/dist/**/*.html',
        'client/dist/**/*.js',
        'client/dist/**/*.css',
        'client/dist/**/*.png',
        'client/dist/**/*.jpeg'
    ], server.notify);

    gulp.watch([
        'client/src/**/*.css',
        'client/src/**/*.js'
    ], ['build:client']);

    gulp.watch([
        'server/src/**/*.js'
    ], ['build:server']);

    gulp.watch([
        'client/tests/phantomjs/**/*.js'
    ], ['build:tests']);

    gulp.watch([
        'server/dist/**/*.js'
    ], [server.run]);
});

gulp.task('watch:tests', function() {
    gulp.run('build:tests');

    gulp.watch([
        'client/tests/phantomjs/*.js',
        'client/tests/phantomjs/**/*.js',
        'client/src/**/*.js'
    ], ['build:tests']);
});

gulp.task('tests:phantomjs', function(done) {
    runSequence(
        'build:client',
        'build:tests',
        'mocha:run:console:phantomjs',
        done);
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
        done);
});

gulp.task('build:common', function(done) {
    runSequence(
        [
            'compile:common',
            'compile:protobuf'
        ],
        done
    );
});

gulp.task('build:client', function (done) {
    runSequence(
        ['clean'],
        'compile:client',
        'copy',
        'browserify:client',
        'concat',
        done);
});

gulp.task('build:server', function (done) {
    runSequence(
        'compile:server',
        'copy:server',
        done);
});

gulp.task('build:tests:coverage', function(done) {
    runSequence(
        'build:common',
        'build:client',
        'browserify:client:tests:istanbul',
        done);
});

gulp.task('build:tests', function (done) {
    runSequence(
        'build:common',
        'build:client',
        'browserify:client:tests',
        done);
});

gulp.task('server', function (done) {
    runSequence(
        'build',
        'run:server',
        done);
});

gulp.task('build', function(done) {
    runSequence(
        ['lint:js', 'build:common'],
        ['build:server', 'build:client'],
        done);
});
gulp.task('lint', ['lint:js']);

gulp.task('default', ['build']);
