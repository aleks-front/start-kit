"use strict";
const { src, dest, watch, series } = require('gulp');

// util
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const rimraf = require('rimraf');

// style
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const postcssInlineSvg = require('postcss-inline-svg');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes')

// icons

// images
const imagemin = require('gulp-imagemin');

// javascript
const eslint = require('gulp-eslint');

// html
const pug = require('gulp-pug');

// patch
var path = {
  build: {
    html: './build',
    js: './build/js',
    style: './build/css',
    img: './build/img',
    icons: './build/img/icons',
    fonts: './build/fonts',
    misc: './build/'
  },
  src: {
    html: './src/*.pug',
    js: './src/common/js/main.js',
    style: './src/common/scss/main.scss',
    img: './src/common/assets/images/**/*.*',
    icons: './src/common/assets/icons/*.svg',
    fonts: './src/common/fonts/*.*',
    misc: './src/mics/*.*',
  },
  watch: {
    html: ['./src/*.pug', './src/components/**/*.pug', './src/components/**/**/*.pug'],
    js: './src/common/js/main.js',
    style: ['./src/common/scss/**/*.scss', './src/common/scss/*.scss', './src/components/**/*.scss', './src/components/**/**/*.scss'],
    img: './src/common/assets/images/**/*.*',
    icons: './src/common/assets/icons/*.svg',
    fonts: './src/common/fonts/*.*',
    misc: './src/mics/*.*',
  },
}

var postCssPlugins = [
  autoprefixer(),
  cssnano(),
  postcssFlexbugsFixes(),
  postcssInlineSvg()
]

// Compile pug files into HTML
function html() {
  return src(path.src.html)
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(path.build.html))
}

// Compile Scss files into Css
function style() {

  return src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass({
      pretty: true
    }).on('error', function(err){
      log.error(err.message);
    }))
    .pipe(postcss(postCssPlugins))
    .pipe(rename('main.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.build.style))
}

// Copy fonts files into fonts
function fonts() {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
}

// Copy Misc files into build
function misc() {
  return src(path.src.misc)
    .pipe(dest(path.build.misc))
}

function clean(cb) {
  rimraf(path.build.html, cb);
}

// Serve and watch sass/pug files for changes
function watchAndServe() {
  browserSync.init({
    server: './build',
  })

  watch(path.watch.html, html)
  watch(path.watch.style, style)
  watch(path.watch.fonts, fonts)
  watch(path.watch.misc, misc)
  watch(path.build.html).on('change', browserSync.reload)
}

exports.html = html;
exports.style = style;
exports.fonts = fonts;
exports.misc = misc;
exports.clean = clean;
exports.watch = watchAndServe;

exports.default = series(html, style, misc, watchAndServe);
exports.build = series(clean, html, style, misc);
