var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var jasmineRunner = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');
var reporters = require('jasmine-reporters');
var babel = require('gulp-babel');
// var less = require('gulp-less');
var concatCss = require('gulp-concat-css');
var sourcemaps = require('gulp-sourcemaps');
var server = require('gulp-express');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

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

gulp.task('copy:material.css', function() {
    var MATERIAL_DIR = dirs.bower + '/bootstrap-material-design/dist/css/';
    return gulp.src([
        MATERIAL_DIR + 'material-fullpalette.min.css',
        MATERIAL_DIR + 'roboto.min.css',
        MATERIAL_DIR + 'ripples.min.css'
    ]).pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:material.fonts', function() {
    var MATERIAL_DIR = dirs.bower + '/bootstrap-material-design/dist/fonts/';
    return gulp.src(MATERIAL_DIR + '*').pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:material.js', function() {
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

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js',
        dirs.serverSrc + '/**/*.js',
        dirs.serverSpec + '/**/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('concat:css', function() {
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

gulp.task('compile:server', function() {
    return gulp.src(dirs.server + '/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(dirs.serverDist));
});

gulp.task('jasmine:run:console', function() {
    return gulp.src(dirs.serverSpec + '/**/*Spec.js')
                .pipe(jasmineRunner({
                    reporter: new reporters.TapReporter()
                }));
});

gulp.task('jasmine:run:junit', function(done) {
    gulp.src([dirs.serverDist + '/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            return gulp.src(dirs.serverSpec + '/**/*.js')
                .pipe(jasmineRunner({
                    reporter: new reporters.JUnitXmlReporter({
                        savePath:'testresults',
                        filePrefix: 'junit'
                    })
                }))
                .pipe(istanbul.writeReports({
                    reporters: ['lcov', 'json', 'text', 'text-summary', 'cobertura', 'html']
                }))
                .on('end', done);
        });
});

gulp.task('jasmine:junit', function(done) {
    runSequence(
        'compile:server',
        'jasmine:run:junit',
    done);
});

gulp.task('jasmine:console', function(done) {
    runSequence(
        'compile:server',
        'jasmine:run:console',
    done);
});

gulp.task('jasmine:coverage', function(done) {
    gulp.src([dirs.serverDist + '/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(dirs.serverSpec + '**/*.js')
                .pipe(jasmineRunner({
                    reporter: new reporters.TapReporter()
                }))
                .pipe(istanbul.writeReports())
                .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 }}))
                .on('end', done)
            ;
        });
});

gulp.task('run:server', function() {
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
        'client/src/**/*.js',
        'client/src/**/*.js'
    ], ['build:client']);

    gulp.watch([
        'server/src/**/*.js'
    ], ['build:server']);

    gulp.watch([
        'server/dist/**/*.js'
    ], [server.run]);
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

gulp.task('build:client', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'copy',
        'concat',
    done);
});

gulp.task('build:server', function(done) {
    runSequence(
        'compile:server',
    done);
});

gulp.task('server', function(done) {
    runSequence(
        'build',
        'run:server',
    done);
});

gulp.task('build', ['build:server', 'build:client']);

gulp.task('default', ['build']);
