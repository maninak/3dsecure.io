'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');

const reload = browserSync.reload;


gulp.task('default', () => {
  // place code for your default task here
});

gulp.task('sass', () => {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/css'));
});

// watch files for changes and reload if any detected
gulp.task('serve', ['sass'], () => {
  browserSync({
    server: {
        baseDir: 'src',
    },
    open: false,
  });

  gulp.watch(
    [
      'src/*.html',
      'src/sass/**/*.scss',
      'src/js/**/*.js',
    ],
    ['sass', reload]
  );
});
