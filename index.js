const parser = require("./src/syntax");

module.exports = {
  compile(src) {
    parser.parse(src);
  }
};
