import SourceLocation from "./SourceLocation";
import ErrorInfo from "./ErrorInfo";
import ErrorType from "./ErrorType";
import BaseError from "./BaseError";

export default
class CompilationError extends BaseError {
  name = "TypeCheckError";

  constructor(public infos: ErrorInfo[]) {
    super();
    this.message = "\n" + infos.map(({location, messages})=> {
      return `${location}:\n  ${messages.join("\n  ")}`;
    }).join("\n");
  }

  static typeError(location: SourceLocation, ...messages: string[]) {
    return new CompilationError([
      new ErrorInfo(ErrorType.TypeError, messages, location)
    ]);
  }

  static syntaxError(location: SourceLocation, ...messages: string[]) {
    return new CompilationError([
      new ErrorInfo(ErrorType.SyntaxError, messages, location)
    ]);
  }
}
