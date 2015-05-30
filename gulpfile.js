var gulp = require("gulp");
var shell = require("gulp-shell");

var PARSER_PEGJS = "./src/parser.pegjs";

gulp.task("pegjs", function () {
  return gulp.src(PARSER_PEGJS)
    .pipe(shell([
      "pegjs <%= file.path %>"
    ]));
});

gulp.task("build", ["pegjs"]);

gulp.task("watch", ["build"], function () {
  gulp.watch(PARSER_PEGJS, ["pegjs"]);
});

gulp.task("default", ["watch"]);
