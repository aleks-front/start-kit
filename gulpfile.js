"use strict";
const { src, dest, watch, series } = require('gulp');

// util
const browserSync = require('browser-sync').create()
const rename = require("gulp-rename");

// style
const autoprefixer = require("autoprefixer");
const sass = require("gulp-sass");
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");

// icons

// images
const imagemin = require("gulp-imagemin");

// javascript
const eslint = require("gulp-eslint");

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
    html: './src/*.pug, ./src/layout/**/',
    js: './src/common/js/main.js',
    style: './src/common/scss/main.scss',
    img: './src/common/assets/images/**/*.*',
    icons: './src/common/assets/icons/*.svg',
    fonts: './src/common/fonts/*.*',
    misc: './src/mics/*.*',
  },
  watch: {
    html: ['./src/*.pug', './src/layout/**/'],
    js: './src/common/js/main.js',
    style: ['./src/common/scss/**/*.scss', './src/common/scss/*.scss', './src/components/**/*.scss', './src/components/**/**/*.scss'],
    img: './src/common/assets/images/**/*.*',
    icons: './src/common/assets/icons/*.svg',
    fonts: './src/common/fonts/*.*',
    misc: './src/mics/*.*',
  },
}

// Compile pug files into HTML
function html() {
  return src([path.src.html])
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(path.build.html))
}

// Compile pug files into HTML
function style() {
  return src([path.src.style])
    .pipe(sass({
      pretty: true
    }))
    .pipe(dest(path.build.style))
}

// Serve and watch sass/pug files for changes
function watchAndServe() {
  browserSync.init({
    server: './build',
  })

  watch(path.watch.html, html)
  watch(path.watch.style, style)
  watch(path.build.html).on('change', browserSync.reload)
}

exports.html = html;
exports.style = style;
exports.watch = watchAndServe;

exports.default = series(html, style, watchAndServe);
