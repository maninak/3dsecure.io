'use strict';

const gulp        = require('gulp'),
      runSequence = require('run-sequence'),
      del         = require('del'),
      sass        = require('gulp-sass'),
      browserSync = require('browser-sync');

const reload = browserSync.reload;

// default task executed with plain `gulp` command
gulp.task('default', ['serve']);

// delete `dist` folder
gulp.task('clean', () => {
  return del('dist');
});

// copy files from `src` to `dist` folder
gulp.task('copy', () => {
  return gulp.src([
      'src/assets/**/*',
      'src/*.html',
      'src/js/**/*.js',
    ])
    .pipe(gulp.dest('dist'));
});

// compile scss files into css
gulp.task('sass', () => {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
});

// watch `src` folder for changes and reload browser if any are detected
gulp.task('serve', runSequence('clean', ['copy', 'sass']), () => {
  browserSync({
    server: { baseDir: 'dist' },
    open: false,
  });

  gulp.watch(
    ['src/**/*'],
    () => { runSequence('clean', ['copy', 'sass'], reload) }
  );
});
