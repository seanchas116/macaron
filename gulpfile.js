var gulp = require("gulp");
var shell = require("gulp-shell");
var tslint = require('gulp-tslint');
var path = require("path");
var argv = process.argv.slice(3);

var SRC = "./**/*.ts";
var TESTS = "./dest/test/**/*Test.js";

gulp.task("tsc", shell.task([
  "tsc"
]));

gulp.task("build", ["tsc"]);

gulp.task("watch", shell.task([
  "tsc -w"
]));

gulp.task("test",  shell.task([
  `mocha --colors --require ./babel-hook ${TESTS} ${argv.join(" ")}`
]));

gulp.task("test:debug", shell.task([
  `node-debug _mocha --require ./babel-hook ${TESTS} ${argv.join(" ")}`
]));

gulp.task("lint", function () {
  return gulp.src("./src/**/*.ts")
    .pipe(tslint())
    .pipe(tslint.report("verbose"));
});

gulp.task("default", ["watch"]);
