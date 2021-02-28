var gulp            = require('gulp');
// var changed         = require('gulp-changed');
var concat          = require('gulp-concat');
// var rename          = require('gulp-rename');
// var gulpif          = require('gulp-if');
var sass            = require('gulp-sass');
var sourcemaps      = require('gulp-sourcemaps');
var autoprefixer    = require('gulp-autoprefixer');
var notify          = require("gulp-notify");

var handleErrors = function() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply( this, args );

  // Keep gulp from hanging on this task
  this.emit('end');
};

global.themePath = './wp-content/themes/bam-test/';

var scssPaths = [
  global.themePath+'assets/src/sass/main.scss',
];

// Cache busting
gulp.task( 'cache-bust', function(done) {
  var file = global.themePath+'cache-bust.php';

  require('fs').writeFileSync( file, "<?php\n"+
"DEFINE( \"CACHE_BUSTER\", "+Math.floor(Date.now() / 1000)+" );");
  done();
});

// CSS compilation task
gulp.task('sass', function() {
  return gulp.src( scssPaths )
    .pipe( sourcemaps.init() )
    .pipe( sass( { outputStyle: 'compressed' } ) )
    .pipe( autoprefixer({
      overrideBrowserslist: ['last 6 versions'],
      cascade: false
    }) )
    .pipe( sourcemaps.write( '.', { includeContent: false, sourceRoot: global.themePath + 'assets/src/sass' } ) )
    .on  ( 'error', handleErrors )
    .pipe( gulp.dest( global.themePath+'assets/css' ) );
});

// Javascript compilation
gulp.task('javascript', function() {
  var jsPaths = [
    global.themePath+'assets/src/js/main.js',
    global.themePath+'assets/src/js/vendor/*.js',
    global.themePath+'assets/src/js/components/*.js',
    global.themePath+'assets/src/js/templates/*.js',
  ];

  var dest = global.themePath+'assets/js';

  // ASnyc
  return gulp.src( jsPaths )
    .pipe( concat('main.js') )
    .on( 'error', handleErrors )
    .pipe( gulp.dest( dest ) );
});

gulp.task('build', gulp.parallel('sass', 'javascript', 'cache-bust'));

gulp.task('watch', (done) => {
  gulp.watch( global.themePath+'assets/src/sass/**/*.scss', gulp.parallel('sass') );
  gulp.watch( global.themePath+'assets/src/js/**/*.js', gulp.parallel('javascript') );
  gulp.watch( global.themePath+'assets/**/*.*', gulp.parallel('cache-bust') );

  global.isWatching = true;

  done();
});