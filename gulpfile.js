var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var postcss = require('gulp-postcss');
var imagemin = require('gulp-imagemin');
var pngquant  = require('imagemin-pngquant');
var mozjpeg  = require('imagemin-mozjpeg');
var plumber = require('gulp-plumber');//エラーにより停止防止
var csscomb = require('gulp-csscomb');//css property
var extender = require('gulp-html-extend');
var replace = require('gulp-replace');
var browserSync = require('browser-sync').create();
var ssi = require('browsersync-ssi');
var rimraf = require('rimraf');

// Browser Version
var browsers = { browsers: ['last 2 versions', 'ie >= 9'] };


// Directory
var baseurl = '/';
var dir  = {
  app: 'app',
  dest: 'dist',
  scss: ['app' + baseurl + '/common/css/scss/**/*.scss'],
  css: 'dist' + baseurl + '/common/css',
  initFile: baseurl + '/point/ec01.html'
};


// File Task
gulp.task('html', function(){
  return gulp.src([dir.app + '/**/!(_)*.html'], { base: dir.app })
    .pipe(extender({annotations:false,verbose:false}))
    .pipe(replace(' class=""', ''))
    .pipe(gulp.dest( dir.dest ))
    .pipe(browserSync.stream());
});

gulp.task('sass', function() {
  var plugins = [
      require('autoprefixer')(browsers)
  ];
  return sass(dir.scss)
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(csscomb())
    .pipe(gulp.dest( dir.css ))
    .pipe(browserSync.stream());
});

gulp.task('js', function(){
  return gulp.src([dir.app + '/**/*.js'], { base: dir.app })
    .pipe(gulp.dest( dir.dest ))
    .pipe(browserSync.stream());
});

gulp.task('css', function(){
  return gulp.src([dir.app + '/**/*.css'], { base: dir.app })
    .pipe(gulp.dest( dir.dest ))
});

gulp.task('fonts', function(){
  return gulp.src([dir.app + '/**/*.+(eot|otf|woff|ttf)'], { base: dir.app })
    .pipe(gulp.dest( dir.dest ))
});

gulp.task('image', function(){
  return gulp.src([dir.app + '/**/*.+(jpg|jpeg|png|gif|svg)'], { base: dir.app })
    .pipe(gulp.dest( dir.dest ))
});

gulp.task('imagemin', function(){
  return gulp.src([dir.app + '/**/*.+(jpg|jpeg|png|gif|svg)'], { base: dir.app })
    .pipe(imagemin([
      pngquant({ quality: '65-80', speed: 1 }),
      mozjpeg({ quality: 80 }),
      imagemin.svgo(),
      imagemin.gifsicle()
    ]))
    .pipe(gulp.dest( dir.dest ))
});


// Watch
gulp.task('watch', function() {
  gulp.watch([dir.app + '/**/*.html'], ['html']);
  gulp.watch([dir.app + '/**/*.css'], ['css']);
  gulp.watch([dir.scss], ['sass']);
  gulp.watch([dir.app + '/**/*.js'], ['js']);
  gulp.watch([dir.app + '/**/*.+(eot|otf|woff|ttf)'], ['fonts']);
  gulp.watch([dir.app + '/**/*.+(jpg|jpeg|png|gif|svg)'], ['image']);
});


// Server
gulp.task('server', function() {
  browserSync.init({
    ghostMode: false,
    notify: false,
    startPath: dir.initFile,
    server: {
      baseDir: dir.dest,
      middleware: [
        ssi({ baseDir: dir.dest, ext: '.html' })
      ]
    }
  });
});


// Clean
gulp.task('clean', function (cb) {
  rimraf(dir.dest, cb);
});


gulp.task('default', ['server', 'watch', 'html', 'sass', 'css', 'js', 'fonts', 'image']);
gulp.task('build', ['html', 'sass', 'css', 'js', 'fonts', 'imagemin']);