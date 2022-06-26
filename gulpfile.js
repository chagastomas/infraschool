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
  fileinclude = require('gulp-file-include'),
  concat = require('gulp-concat'),
  browserSync = require('browser-sync').create(),
  bro = require('gulp-bro'),
  babelify = require('babelify');

const paths = {
  html: {
    src: 'src/html/*.html',
    dest: 'dist/',
  },
  partials: {
    src: 'src/html/partials/**/*.html',
  },
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
  boots_styles: {
    src: '/src/scss/bootstrap/*.scss',
    dest: 'dist/arquivos',
  },
  scripts_vendor: {
    src: ['/src/js/vendor/*.js'],
    dest: 'dist/arquivos',
  },
};

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(gulp.dest(paths.html.dest));
}

function partials() {
  return gulp.src(paths.partials.src).pipe(
    fileinclude({
      prefix: '@@',
      basepath: '@file',
    })
  );
}

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
      baseDir: './dist/',
    },
  });
  gulp.watch(paths.styles.src, style);
  gulp.watch(paths.scripts.src, script);
  gulp.watch(paths.images.src, image);
  gulp.watch('./src/html/**/*.html').on('change', gulp.series(partials, html, reload));
  gulp.watch(paths.boots_styles.src, bootstrap_style);
  gulp.watch(paths.scripts_vendor.src, scripts_vendor);
}

// Exposing the tasks is important for it's allowing to run it on the command line

// $ gulp watch
exports.watch = watch;
// $ gulp html
exports.html = gulp.series(partials, html);
// $ gulp style
exports.style = style;
// $ gulp script
exports.script = script;
// $ gulp script
exports.image = image;
// $ gulp bootstrap
exports.bootstrap_style = bootstrap_style;
// $ gulp script
exports.scriptsvendor = scripts_vendor;
// $ gulp serve
exports.serve = gulp.parallel(
  partials,
  html,
  style,
  script,
  image,
  bootstrap_style,
  scripts_vendor,
  watch
);

const build = gulp.parallel(partials, html, style, script, image, bootstrap_style, scripts_vendor);
// $ gulp
gulp.task('default', build);
