'use strict';

/*-----------------------------*\
 *  PLUGINS
\*-----------------------------*/

const gulp        = require('gulp'),
      runSequence = require('run-sequence'),
      del         = require('del'),
      sass        = require('gulp-sass'),
      autoprefixr = require('gulp-autoprefixer'),
      browserSync = require('browser-sync'),
      uncss       = require('gulp-uncss'),
      cssnano     = require('gulp-cssnano'),
      htmlmin     = require('gulp-htmlmin'),
      uglifyjs    = require('gulp-uglify');

const reload = browserSync.reload;



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

// default task executed with plain `gulp` command
gulp.task('default', ['serve:dev']);

// delete `dist` folder
gulp.task('clean:dest', () => {
  return del(DEST_DIR);
});

// copy assets from `src` to `dist` folder
gulp.task('copy:assets', () => {
  return gulp.src(ASSETS_SRC_GLOB).pipe(gulp.dest(`${DEST_DIR}/assets`));
});

// copy raw html files from `src` to `dist` folder (for developments)
gulp.task('copy:html', () => {
  return gulp.src(HTML_SRC_GLOB).pipe(gulp.dest(DEST_DIR));
});


// copy raw js files from `src` to `dist` folder (for developments)
gulp.task('copy:js', () => {
  return gulp.src(JS_SRC_GLOB).pipe(gulp.dest(`${DEST_DIR}/assets`));
});

// compile scss files into css
gulp.task('transpile:sass', () => {
  return gulp.src(SASS_SRC_GLOB)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixr({ browsers: ['last 5 versions'] }))
    .pipe(gulp.dest(`${DEST_DIR}/assets`));
});

// serve unminified code and watch for src changes. If any detected rebuild `dist` and reload browser
gulp.task('serve:dev', () => {
  runSequence('clean:dest', ['copy:assets', 'copy:html', 'copy:js', 'transpile:sass']);
  
  browserSync({
    server: { baseDir: DEST_DIR },
    open: false,
  });

  gulp.watch(
    [`${SRC_DIR}/**/*`],
    () => { runSequence('clean:dest', ['copy:assets', 'copy:html', 'copy:js', 'transpile:sass'], reload); }
  );
});

// remove unused css rules
gulp.task('treeshake:css', () => {
  return gulp.src(`${DEST_DIR}/assets/*.css`)
    .pipe(uncss({
      html: [HTML_SRC_GLOB]
    }))
    .pipe(gulp.dest(`${DEST_DIR}/assets`));
});

// minify css files
gulp.task('minify:css', () => {
  return gulp.src(`${DEST_DIR}/assets/*.css`)
    .pipe(cssnano())
    .pipe(gulp.dest(`${DEST_DIR}/assets`));
});

// build css for production
gulp.task('build:css-prod', () => {
  runSequence('transpile:sass', 'treeshake:css', 'minify:css');
});

// minify html files
gulp.task('minify:html', () => {
  return gulp.src(HTML_SRC_GLOB)
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
    .pipe(gulp.dest(`${DEST_DIR}/assets`));
});

gulp.task('build:prod', () => {
  runSequence('clean:dest', ['copy:assets', 'build:css-prod', 'minify:html', 'minify:js']);
});
