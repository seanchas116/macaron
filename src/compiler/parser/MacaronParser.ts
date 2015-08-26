import {ExpressionAST} from "../parser/AST";
import CompilationError from "../common/CompilationError";
import SourceLocation from "../common/SourceLocation";
const parser = require("./parserImpl");

export default
class MacaronParser {
  constructor(public source: string) {
  }

  parse() {
    try {
      return parser.parse(this.source);
    }
    catch (error) {
      if (error.name == "SyntaxError") {
        throw CompilationError.syntaxError(
          error.message,
          new SourceLocation(error.line, error.column, error.offset)
        );
      } else {
        throw error;
      }
    }
  }
}
