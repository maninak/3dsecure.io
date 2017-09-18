'use strict';

const gulp        = require('gulp'),
      runSequence = require('run-sequence'),
      del         = require('del'),
      sass        = require('gulp-sass'),
      autoprefixr = require('gulp-autoprefixer'),
      browserSync = require('browser-sync'),
      cssnano     = require('gulp-cssnano'),
      htmlmin     = require('gulp-htmlmin'),
      uglifyjs    = require('gulp-uglify');

const reload = browserSync.reload;


// default task executed with plain `gulp` command
gulp.task('default', ['serve-dev']);

// delete `dist` folder
gulp.task('cleanDist', () => {
  return del('dist');
});

// copy assets from `src` to `dist` folder
gulp.task('copyAssets', () => {
  return gulp.src([ 'src/assets/**/*' ]).pipe(gulp.dest('dist'));
});

// copy raw html files from `src` to `dist` folder (for developments)
gulp.task('copyHTML', () => {
  return gulp.src('src/*.html').pipe(gulp.dest('dist'));
});


// copy raw js files from `src` to `dist` folder (for developments)
gulp.task('copyJS', () => {
  return gulp.src('src/js/**/*.js').pipe(gulp.dest('dist/assets'));
});

// compile scss files into css
gulp.task('transpSass', () => {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixr({ browsers: ['last 10 versions'] }))
    .pipe(gulp.dest('dist/assets'));
});

// serve unminified code and watch for src changes. If any detected rebuild `dist` and reload browser
gulp.task('serveDev', () => {
  runSequence('cleanDist', ['copyAssets', 'copyHTML', 'copyJS', 'transpSass']);
  
  browserSync({
    server: { baseDir: 'dist' },
    open: false,
  });

  gulp.watch(
    ['src/**/*'],
    () => { runSequence('cleanDist', ['copyAssets', 'copyHTML', 'copyJS', 'transpSass'], reload); }
  );
});

// minify css files
gulp.task('minifyCSS', () => {
  return gulp.src('dist/assets/*.css')
    .pipe(cssnano())
    .pipe(gulp.dest('dist/assets'));
});

// minify html files
gulp.task('minifyHTML', () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      sortAttributes: true,
      sortClassName: true,
    }))
    .pipe(gulp.dest('dist'));
});

// build css for production
gulp.task('buildProdCSS', () => {
  runSequence('transpSass', 'minifyCSS');
});

// minify js files
gulp.task('minifyJS', () => {
  return gulp.src('src/js/*.js')
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
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('buildProd', () => {
  runSequence('cleanDist', ['copyAssets', 'buildProdCSS', 'minifyHTML', 'minifyJS']);
});
