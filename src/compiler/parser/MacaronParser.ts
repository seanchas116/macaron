import {ExpressionAST} from "../parser/AST";
import CompilationError from "../common/CompilationError";
import SourceLocation from "../common/SourceLocation";
import {SyntaxError} from "./Parser";
import {parseLines} from "./parsing/block";
//const parser = require("./parserImpl");

export default
class MacaronParser {
  constructor(public source: string) {
  }

  parse() {
    try {
      return parseLines.parse(this.source);
    }
    catch (error) {
      if (error instanceof SyntaxError) {
        throw CompilationError.syntaxError(
          error.message,
          error.position
        );
      } else {
        throw error;
      }
    }
  }
}
