var gulp = require("gulp");
var shell = require("gulp-shell");

var COMPILER_SRC = "./src/compiler";
var COMPILER_DEST = "./dest/compiler";
var PEGJS_SRC = `${COMPILER_SRC}/parser/parserImpl.pegjs`;
var PEGJS_DEST = `${COMPILER_DEST}/parser/parserImpl.js`;
var SRC = "./**/*.ts";
var OTHER_SRC = `./src/**/!(*.ts|*.pegjs)`;
var TESTS = "./dest/test/**/*Test.js";

gulp.task("tsc", shell.task([
  "tsc"
]));

gulp.task("pegjs", shell.task([
  `mkdir -p ${COMPILER_DEST}`,
  `pegjs ${PEGJS_SRC} ${PEGJS_DEST}`
]));

gulp.task("copy", function () {
  return gulp.src(OTHER_SRC, {base: "./src"})
    .pipe(gulp.dest("./dest"));
});

gulp.task("build", ["pegjs", "tsc", "copy"]);

gulp.task("watch", ["build"], function () {
  gulp.watch(PEGJS_SRC, ["pegjs"]);
  gulp.watch(SRC, ["tsc"]);
});

gulp.task("test",  shell.task([
  `mocha --require ./babel-hook ${TESTS}`
]));

gulp.task("test:debug", shell.task([
  `node-debug _mocha --require ./babel-hook ${TESTS}`
]));

gulp.task("default", ["watch"]);
