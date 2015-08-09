import SourceLocation from "../parser/SourceLocation";
import ErrorType from "./ErrorType";

export default
class ErrorInfo {
  constructor(public type: ErrorType, public message: string, public location: SourceLocation) {
  }
}
