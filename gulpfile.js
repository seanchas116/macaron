var gulp = require("gulp");
var shell = require("gulp-shell");

var COMPILER_SRC = "./src/compiler";
var COMPILER_DEST = "./dest/compiler";
var PEGJS_SRC = `${COMPILER_SRC}/parser.pegjs`;
var PEGJS_DEST = `${COMPILER_DEST}/parser.js`;
var SRC = "./**/*.ts";
var TESTS = "./dest/test/**/*Test.js";

gulp.task("tsc", shell.task([
  "tsc"
]));

gulp.task("pegjs", shell.task([
  `mkdir -p ${COMPILER_DEST}`,
  `pegjs ${PEGJS_SRC} ${PEGJS_DEST}`
]));

gulp.task("build", ["pegjs", "tsc"]);

gulp.task("watch", ["build"], function () {
  gulp.watch(PEGJS_SRC, ["pegjs"]);
  gulp.watch(SRC, ["tsc"]);
});

gulp.task("test", ["build"], shell.task([
  `mocha --require ./babel-hook ${TESTS}`
]));

gulp.task("default", ["watch"]);
