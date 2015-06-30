import SourceLocation from "./SourceLocation";
import ErrorInfo from "./ErrorInfo";
import ErrorType from "./ErrorType";
import * as util from "util";

// TODO: extends Error
export default
class CompilerError implements Error {
  name = "TypeCheckError";
  message: string;
  error: Error;

  get stack() {
    return this.error["stack"];
  }

  constructor(public errorInfos: ErrorInfo[]) {
    const message = errorInfos.map(info => info.message).join("\n`");
    this.error = new Error(message);
    this.message = this.error.message;
  }

  static typeError(message: string, location: SourceLocation) {
    return new CompilerError([
      new ErrorInfo(ErrorType.TypeError, message, location)
    ]);
  }

  static parseError(message: string, location: SourceLocation) {
    return new CompilerError([
      new ErrorInfo(ErrorType.ParseError, message, location)
    ])
  }
}

util.inherits(CompilerError, Error);
