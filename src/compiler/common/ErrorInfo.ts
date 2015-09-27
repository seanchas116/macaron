import SourceLocation from "./SourceLocation";
import ErrorType from "./ErrorType";

export default
class ErrorInfo {
  constructor(public type: ErrorType, public summary: string, public descriptions: string[], public location: SourceLocation) {
  }
}
