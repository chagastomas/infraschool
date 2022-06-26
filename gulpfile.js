const gulp = require('gulp'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  babel = require('gulp-babel'),
  imageMin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  browserSync = require('browser-sync').create(),
  bro = require('gulp-bro'),
  babelify = require('babelify');

const paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/arquivos',
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/arquivos',
  },
  images: {
    src: 'src/images/**/*',
    dest: 'dist/arquivos',
  },
  styles_vendor: {
    src: 'vendor/scss/*.scss',
    dest: 'dist/arquivos',
  },
  boots_styles: {
    src: 'vendor/scss/bootstrap/*.scss',
    dest: 'dist/arquivos',
  },
  scripts_vendor: {
    src: ['vendor/js/*.js'],
    dest: 'dist/arquivos',
  },
};

function style() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function script() {
  const babelConfig = {
    presets: [['@babel/preset-env']],
    plugins: ['@babel/plugin-transform-runtime'],
  };

  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      bro({
        transform: [babelify.configure(babelConfig)],
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function image() {
  return gulp
    .src(paths.images.src)
    .pipe(cache(imageMin()))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

function styles_vendor() {
  return gulp
    .src(paths.styles_vendor.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles_vendor.dest))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles_vendor.dest));
}

function bootstrap_style() {
  return gulp
    .src(paths.boots_styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.boots_styles.dest))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.boots_styles.dest))
    .pipe(browserSync.stream());
}

function scripts_vendor() {
  return gulp
    .src(paths.scripts_vendor.src)
    .pipe(
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['ie >= 11'],
              },
            },
          ],
        ],
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts_vendor.dest))
    .pipe(browserSync.stream());
}

function reload() {
  browserSync.reload();
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
  gulp.watch(paths.styles.src, style);
  gulp.watch(paths.scripts.src, script);
  gulp.watch(paths.images.src, image);
  gulp.watch('*.html').on('change', reload);
  gulp.watch(paths.styles_vendor.src, styles_vendor);
  gulp.watch(paths.boots_styles.src, bootstrap_style);
  gulp.watch(paths.scripts_vendor.src, scripts_vendor);
}

// Exposing the tasks is important for it's allowing to run it on the command line

// $ gulp watch
exports.watch = watch;
// $ gulp style
exports.style = style;
// $ gulp script
exports.script = script;
// $ gulp script
exports.image = image;
// $ gulp style vendor
exports.styles_vendor = styles_vendor;
// $ gulp bootstrap
exports.bootstrap_style = bootstrap_style;
// $ gulp script
exports.scriptsvendor = scripts_vendor;
// $ gulp serve
exports.serve = gulp.parallel(
  style,
  script,
  image,
  watch,
  styles_vendor,
  bootstrap_style,
  scripts_vendor
);

const build = gulp.parallel(style, script, image, styles_vendor, bootstrap_style, scripts_vendor);
// $ gulp
gulp.task('default', build);
