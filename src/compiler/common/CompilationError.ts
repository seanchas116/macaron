import SourceLocation from "./SourceLocation";
import ErrorInfo from "./ErrorInfo";
import ErrorType from "./ErrorType";
import BaseError from "./BaseError";

export default
class CompilationError extends BaseError {
  name = "TypeCheckError";

  constructor(public infos: ErrorInfo[]) {
    super();
    this.message = "\n" + infos.map(({location, summary, descriptions})=> {
      return `[${location.line}:${location.column}] ${summary}\n  ${descriptions.join("\n  ")}`;
    }).join("\n");
  }

  static typeError(location: SourceLocation, summary: string, ...descriptions: string[]) {
    return new CompilationError([
      new ErrorInfo(ErrorType.TypeError, summary, descriptions, location)
    ]);
  }

  static syntaxError(location: SourceLocation, summary: string, ...descriptions: string[]) {
    return new CompilationError([
      new ErrorInfo(ErrorType.SyntaxError, summary, descriptions, location)
    ]);
  }
}
