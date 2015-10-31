import {ExpressionAST} from "../parser/AST";
import CompilationError from "../common/CompilationError";
import {SyntaxError} from "./Parser";
import {parseLines} from "./parsing/block";

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
          error.position,
          error.message
        );
      } else {
        throw error;
      }
    }
  }
}
