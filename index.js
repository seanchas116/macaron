const parser = require("./src/parser");

module.exports = {
  compile(src) {
    parser.parse(src);
  }
};
