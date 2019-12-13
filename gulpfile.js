"use strict";

const { src, dest, watch, series, parallel } = require('gulp');

// util
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const rimraf = require('rimraf');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const size = require('gulp-size');

// javascript
const uglify = require('gulp-uglify');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

// style
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const postcssInlineSvg = require('postcss-inline-svg');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssNormalize = require('postcss-normalize');

// icons
const svgmin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');

// images
const imagemin = require('gulp-imagemin');

// html
const pug = require('gulp-pug');

// patch
var path = {
  build: {
    html: './build',
    js: './build/js',
    style: './build/css',
    images: './build/images',
    icons: './build/images/icons',
    fonts: './build/fonts',
    misc: './build/'
  },
  src: {
    html: './src/*.pug',
    js: './src/common/js/main.js',
    style: './src/common/scss/main.scss',
    images: './src/common/assets/images/*.*',
    icons: './src/common/assets/icons/*.svg',
    fonts: './src/common/fonts/*.*',
    misc: './src/mics/*.*',
  },
  watch: {
    html: ['./src/*.pug', './src/components/**/*.pug', './src/components/**/**/*.pug'],
    js: ['./src/common/js/*.js', './src/components/**/*.js', './src/components/**/**/*.js'],
    style: ['./src/common/scss/**/*.scss', './src/common/scss/*.scss', './src/components/**/*.scss', './src/components/**/**/*.scss'],
    images: './src/common/assets/images/*.*',
    icons: './src/common/assets/icons/*.svg',
    fonts: './src/common/fonts/*.*',
    misc: './src/mics/*.*',
  },
}

var postCssPlugins = [
  autoprefixer(),
  cssnano(),
  postcssFlexbugsFixes(),
  postcssInlineSvg(),
  postcssNormalize()
];

// Compile pug files into HTML
function html() {
  return src(path.src.html)
    .pipe(pug({
      pretty: true
    }))
    .pipe(size())
    .pipe(dest(path.build.html));
}

// Compile Javascript files into bulild main js
function js() {
  return src(path.src.js)
  .pipe(webpackStream({
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
              presets: ['@babel/preset-env'],
            },
          }
        ],
      },
      externals: {
        jquery: 'jQuery'
      }
    }), webpack)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(size())
    .pipe(dest(path.build.js));
}

// Compile Scss files into Css
function style() {
  return src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass({
      pretty: true,
      includePaths: ['./node_modules']
    }))
    .pipe(plumber())
    .pipe(postcss(postCssPlugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(dest(path.build.style));
}

// Copy ,and Optimize, images into build
function images() {
  return src(path.src.images)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 8 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(size())
    .pipe(dest(path.build.images));
}

// Copy icons inot build
function icons() {
  return src(path.src.icons)
    // minify svg
    .pipe(svgmin({
        js2svg: {
            pretty: true
        }
    }))
    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
        run: function ($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        },
        parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
					sprite: '../sprite.svg',
        }
      }
    }))
    .pipe(size())
    .pipe(dest(path.build.icons));
}

// Copy fonts files into fonts
function fonts() {
  return src(path.src.fonts)
    .pipe(size())
    .pipe(dest(path.build.fonts));
}

// Copy Misc files into build
function misc() {
  return src(path.src.misc)
    .pipe(size())
    .pipe(dest(path.build.misc));
}

// Сlean build folder
function clean(cb) {
  rimraf(path.build.html, cb);
}

// Serve and watch sass/pug files for changes
function watchAndServe() {
  browserSync.init({
    server: path.build.html,
  });
  watch(path.watch.html, html);
  watch(path.watch.js, js);
  watch(path.watch.style, style);
  watch(path.watch.images, images);
  watch(path.watch.icons, icons);
  watch(path.watch.fonts, fonts);
  watch(path.watch.misc, misc);
  watch(path.build.html).on('change', browserSync.reload);
}

exports.html = html;
exports.js = js;
exports.style = style;
exports.fonts = fonts;
exports.images = images;
exports.icons = icons;
exports.misc = misc;
exports.clean = clean;
exports.watch = watchAndServe;

exports.default = series(parallel(html, js, style, images, icons, fonts, misc), watchAndServe);
exports.build = series(clean, parallel(html, js, style, images, icons, fonts, misc));
