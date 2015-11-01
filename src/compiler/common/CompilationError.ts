import SourceRange from "./SourceRange";
import ErrorInfo from "./ErrorInfo";
import ErrorType from "./ErrorType";
import BaseError from "./BaseError";

export default
class CompilationError extends BaseError {
  name = "TypeCheckError";

  constructor(public infos: ErrorInfo[]) {
    super();
    this.message = "\n" + infos.map(({range, summary, descriptions})=> {
      const {begin} = range;
      return `[${begin.filePath}:${begin.line}:${begin.column}] ${summary}\n  ${descriptions.join("\n  ")}`;
    }).join("\n");
  }

  static typeError(range: SourceRange, summary: string, ...descriptions: string[]) {
    return new CompilationError([
      new ErrorInfo(ErrorType.TypeError, summary, descriptions, range)
    ]);
  }

  static syntaxError(range: SourceRange, summary: string, ...descriptions: string[]) {
    return new CompilationError([
      new ErrorInfo(ErrorType.SyntaxError, summary, descriptions, range)
    ]);
  }
}
