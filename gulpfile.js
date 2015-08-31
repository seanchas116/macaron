var gulp = require("gulp");
var shell = require("gulp-shell");
var path = require("path");

var SRC = "./**/*.ts";
var TESTS = "./dest/test/**/*Test.js";

gulp.task("tsc", shell.task([
  "tsc"
]));

gulp.task("build", ["tsc"]);

gulp.task("watch", ["build"], function () {
  gulp.watch(SRC, ["build"]);
});

gulp.task("test",  shell.task([
  `mocha --require ./babel-hook ${TESTS}`
]));

gulp.task("test:debug", shell.task([
  `node-debug _mocha --require ./babel-hook ${TESTS}`
]));

gulp.task("default", ["watch"]);
