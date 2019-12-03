"use strict";

const gulp = require("gulp");

// util
const browsersync = require("browser-sync").create();
const rename = require("gulp-rename");
const cp = require("child_process");
const del = require("del");
const plumber = require("gulp-plumber");

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



var path = {
    build: {
        html: 'build',
        js: 'build/js',
        css: 'build/css',
        img: 'build/img',
        icons: 'build/img/icons',
        fonts: 'build/fonts',
    },
    src: {
        
    },
    watch: {

    },
}