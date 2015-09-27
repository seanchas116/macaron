import SourceLocation from "./SourceLocation";
import ErrorType from "./ErrorType";

export default
class ErrorInfo {
  constructor(public type: ErrorType, public messages: string[], public location: SourceLocation) {
  }
}
