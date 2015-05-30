var gulp = require("gulp");
var shell = require("gulp-shell");

var PARSER_PEGJS = "./src/parser.pegjs";
var SRC = "./src/*.ts";

function pegjs() {
  return shell([
    "pegjs <%= file.path %>"
  ]);
}

function tsc() {
  return shell([
    "tsc <%= file.path %> --target ES6"
  ]);
}

gulp.task("tsc", function () {
  return gulp.src(SRC)
    .pipe(tsc());
});

gulp.task("pegjs", function () {
  return gulp.src(PARSER_PEGJS)
    .pipe(pegjs());
});

gulp.task("build", ["pegjs", "tsc"]);

gulp.task("watch", ["build"], function () {
  gulp.watch(PARSER_PEGJS, ["pegjs"]);
  gulp.watch(SRC, ["tsc"]);
});

gulp.task("default", ["watch"]);
