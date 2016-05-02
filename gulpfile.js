var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var templateCache = require('gulp-angular-templatecache');
var browserSync = require('browser-sync').create();
var env = gutil.env.env || 'development';
var buildDir = (env === 'production') ? 'build' : 'dist';

var vendorJsFiles = [
  './node_modules/angular/angular.js',
  './node_modules/angular-sanitize/angular-sanitize.js',
  './node_modules/angular-animate/angular-animate.js',
  './node_modules/angular-ui-router/release/angular-ui-router.js',
  './node_modules/angular-ui-bootstrap/src/position/position.js',
  './node_modules/angular-ui-bootstrap/src/dropdown/dropdown.js',
  './node_modules/angular-hotkeys/build/hotkeys.js',
  './node_modules/underscore/underscore.js',
  './node_modules/fastclick/lib/fastclick.js'
];

//browsers list matches Bootstrap v4's supported browsers
var supportedBrowsers = [
  'Chrome >= 35',
  'Firefox >= 31',
  'Edge >= 12',
  'Explorer >= 9',
  'iOS >= 8',
  'Safari >= 8',
  'Android 2.3',
  'Android >= 4',
  'Opera >= 12'
];

// Build a javascript bundle of all application js files
gulp.task('build-app-js', function() {
  return gulp.src('./app/**/*.js')
    .pipe(plumber())
    .pipe(env === 'production' ? uglify() : gutil.noop())
    .pipe(concat('backlogr.js'))
    .pipe(gulp.dest('./' + buildDir + '/js/'));
});

// Build a javascript bundle of all vendor js files
gulp.task('build-vendor-js', function() {
  return gulp.src(vendorJsFiles)
    .pipe(plumber())
    .pipe(env === 'production' ? uglify() : gutil.noop())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./' + buildDir + '/js/'));
});

// preload templates into $templateCache
gulp.task('populate-template-cache', function() {
  return gulp.src('./app/templates/**/*.html')
    .pipe(plumber())
    .pipe(htmlmin({collapseWhitespace: true, conservativeCollapse: true}))
    .pipe(templateCache('templates.js', {module: 'backlogr'}))
    .pipe(gulp.dest(buildDir + '/js'));
});

// runs sass
gulp.task('build-css', function() {
  var handledSass = sass({
    outputStyle: (env === 'production') ? 'compressed' : 'nested'
  });

  //prevent sass errors from crashing gulp/watch
  handledSass.on('error', function(e) {
    gutil.log(e);
    handledSass.emit('end');
  });

  return gulp.src('./app/styles/*')
    .pipe(handledSass)
    .pipe(autoprefixer({browsers: supportedBrowsers}))
    .pipe(gulp.dest('./' + buildDir + '/css'));
});

// copy static assets
gulp.task('copy-static-assets', function() {
  return gulp.src('./public/**/*')
    .pipe(plumber())
    .pipe(gulp.dest(buildDir));
});

// full build
gulp.task('build', ['populate-template-cache', 'build-vendor-js', 'build-app-js', 'build-css', 'copy-static-assets'], function() {
  //TODO cache busting/fingerprinting of files/modify index.html src paths
  return gulp.src('./app/index.html')
    .pipe(plumber())
    .pipe(gulp.dest(buildDir));
});

gulp.task('watch', function() {
  gulp.watch([
    'app/index.html',
    'app/templates/**/*.html', 
    'app/styles/**/*.scss', 
    'app/**/*.js',
    'public/**/*'
  ], ['build']);
})

// launches a web server that serves files in the current directory
gulp.task('serve',  ['build', 'watch'], function() {
  browserSync.init({
    files: ["./" + buildDir + "/*"],
    server: {
      baseDir: "./" + buildDir,
    }
  });
});

// launch a build upon modification and publish it to a running server
gulp.task('dev', ['serve']);

// installs and builds everything
gulp.task('default', ['build']);