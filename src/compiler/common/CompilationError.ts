import SourceLocation from "./SourceLocation";
import ErrorInfo from "./ErrorInfo";
import ErrorType from "./ErrorType";
import BaseError from "./BaseError";

export default
class CompilationError extends BaseError {
  name = "TypeCheckError";

  constructor(public infos: ErrorInfo[]) {
    super();
    this.message = "\n" + infos.map(info => {
      return `${info.location}: ${info.message}`;
    }).join("\n");
  }

  static typeError(message: string, location: SourceLocation) {
    return new CompilationError([
      new ErrorInfo(ErrorType.TypeError, message, location)
    ]);
  }

  static syntaxError(message: string, location: SourceLocation) {
    return new CompilationError([
      new ErrorInfo(ErrorType.SyntaxError, message, location)
    ])
  }
}
