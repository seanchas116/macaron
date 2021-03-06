import CompilationError from "../common/CompilationError";
import {SyntaxError} from "tparse";
import {parseLines} from "./parsing/block";

export default
class MacaronParser {
  constructor(public filePath: string, public source: string) {
  }

  parse() {
    try {
      return parseLines.parse(this.filePath, this.source);
    }
    catch (error) {
      if (error instanceof SyntaxError) {
        throw CompilationError.syntaxError(
          error.range,
          error.message
        );
      } else {
        throw error;
      }
    }
  }
}
