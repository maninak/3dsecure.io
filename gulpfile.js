'use strict';

/*-----------------------------*\
 *  PLUGINS
\*-----------------------------*/

const gulp        = require('gulp'),
      fs          = require('fs'),
      clean       = require('gulp-clean'),
      newer       = require('gulp-newer'),
      sass        = require('gulp-sass'),
      autoprefixr = require('gulp-autoprefixer'),
      browserSync = require('browser-sync'),
      uncss       = require('gulp-uncss'),
      cssnano     = require('gulp-cssnano'),
      htmlmin     = require('gulp-htmlmin'),
      criticalCss = require('gulp-critical-css'),
      inlinesrc   = require('gulp-inline-source'),
      uglifyjs    = require('gulp-uglify');



/*-----------------------------*\
 *  CONFIG
\*-----------------------------*/

const SRC_DIR         = 'src',
      DEST_DIR        = 'dist';

const ASSETS_SRC_GLOB = `${SRC_DIR}/assets/**/*`,
      HTML_SRC_GLOB   = `${SRC_DIR}/*.html`,
      SASS_SRC_GLOB   = `${SRC_DIR}/sass/**/*.scss`,
      JS_SRC_GLOB     = `${SRC_DIR}/js/**/*.js`;



/*-----------------------------*\
 *  TASKS
\*-----------------------------*/

/*
    Shared
*/

// default task executed with plain `gulp` command
gulp.task('default', () => {
  return gulp.series('serve:dev')
});

// delete dest folder
gulp.task('clean:dest', () => {
  try {
    // fs.accessSync() tests if DEST_DIR exists and if not it throws
    // this way gulp.src() won't execute and crash
    fs.accessSync(DEST_DIR);
    return gulp.src(DEST_DIR, { read: false })
      .pipe(clean());
  }
  catch (e) {
    return gulp.src('.');
  }
});

/*
    Development
*/

// copy raw assets from src to dest folder
gulp.task('copy:assets', () => {
  return gulp.src(ASSETS_SRC_GLOB)
    .pipe(newer(`${DEST_DIR}/assets`))
    .pipe(gulp.dest(`${DEST_DIR}/assets`))
    .pipe(browserSync.reload({ stream:true }));
});

// copy raw html files from src to dest folder
gulp.task('copy:html', () => {
  return gulp.src(HTML_SRC_GLOB)
    .pipe(newer(DEST_DIR))
    .pipe(gulp.dest(DEST_DIR))
    .pipe(browserSync.reload({ stream:true }));
});

// copy raw js files from src to dest folder
gulp.task('copy:js', () => {
  return gulp.src(JS_SRC_GLOB)
    .pipe(newer(`${DEST_DIR}`))
    .pipe(gulp.dest(`${DEST_DIR}`))
    .pipe(browserSync.reload({ stream:true }));
});

// compile scss files into css and add vendor prefixes
gulp.task('transpile:sass', () => {
  return gulp.src(SASS_SRC_GLOB)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixr({ browsers: ['last 5 versions'] }))
    .pipe(newer(`${DEST_DIR}`))
    .pipe(gulp.dest(`${DEST_DIR}`))
    .pipe(browserSync.reload({ stream:true }));
});

// make a fresh dev build
gulp.task(
    'build:dev',
    gulp.series('clean:dest', gulp.parallel('copy:assets', 'copy:html', 'copy:js', 'transpile:sass')));

// on asset file changes, refresh dev build and reload browser
gulp.task('watch:assets', () => {
  gulp.watch(ASSETS_SRC_GLOB, gulp.series('copy:assets'));
});

// on html source file changes, refresh dev build and reload browser
gulp.task('watch:html', () => {
  gulp.watch(HTML_SRC_GLOB, gulp.series('copy:html'));
});

// on js source file changes, refresh dev build and reload browser
gulp.task('watch:js', () => {
  gulp.watch(JS_SRC_GLOB, gulp.series('copy:js'));
});

// on sass source file changes, refresh dev build and reload browser
gulp.task('watch:sass', () => {
  gulp.watch(SASS_SRC_GLOB, gulp.series('transpile:sass'));
});

// wrapper task that calls all watchers
gulp.task('watch:all', gulp.parallel('watch:assets', 'watch:html', 'watch:js', 'watch:sass'));

// launch a web server
gulp.task('launch:web-server', (done) => {
  browserSync({
    server: { baseDir: DEST_DIR },
    open: false,
  }, done);
});

// serve unoptimized code and watch for src changes
gulp.task('serve:dev', gulp.series('build:dev', gulp.parallel('launch:web-server', 'watch:all')));

/*
    Production
*/

gulp.task('inline:html', () => {
  return gulp.src(`${DEST_DIR}/*.html`)
    .pipe(inlinesrc())
    .pipe(gulp.dest(DEST_DIR));
});

// minify html files
gulp.task('minify:html', () => {
  return gulp.src(`${DEST_DIR}/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      sortAttributes: true,
      sortClassName: true,
    }))
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task('generate:html-prod', gulp.series('copy:html', 'inline:html', 'minify:html'));

// minify js files
gulp.task('minify:js', () => {
  return gulp.src(JS_SRC_GLOB)
    .pipe(
      uglifyjs({
        compress: {
          dead_code: true,
          drop_debugger: true,
          unsafe_Func: true,
          unsafe_math: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          typeofs: true,
          loops: true,
          unused: true,
          if_return: true,
          inline: true,
          join_vars: true,
          collapse_vars: true,
          reduce_vars: true,
          warnings:true,
          passes: 2,
        },
        output: {
          beautify: false,
        }
      })
    )
    .pipe(gulp.dest(`${DEST_DIR}`));
});

// remove unused css rules
gulp.task('treeshake:css', () => {
  return gulp.src(`${DEST_DIR}/*.css`)
    .pipe(uncss({ html: [HTML_SRC_GLOB] }))
    .pipe(criticalCss()) // generate *.critical.css
    .pipe(gulp.dest(`${DEST_DIR}`));
});

// minify css files
gulp.task('minify:css', () => {
  return gulp.src(`${DEST_DIR}/*.css`)
    .pipe(cssnano())
    .pipe(gulp.dest(`${DEST_DIR}`));
});

// build css for production
gulp.task('generate:css-prod', gulp.series('transpile:sass', 'treeshake:css', 'minify:css'));

// make a fresh production build
gulp.task('build:prod',
    gulp.series('clean:dest', 
        gulp.parallel('copy:assets', 
            gulp.series(gulp.parallel('minify:js', 'generate:css-prod'), 'generate:html-prod'))));
