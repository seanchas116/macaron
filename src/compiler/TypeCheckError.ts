import SourceLocation from "./SourceLocation";
import * as util from "util";

// TODO: extends Error
export default
class TypeCheckError implements Error {
  name = "TypeCheckError";
  message: string;
  error: Error;

  get stack() {
    return this.error["stack"];
  }

  constructor(message: string, public location: SourceLocation) {
    this.error = new Error(message);
    this.message = this.error.message;
  }
}

util.inherits(TypeCheckError, Error);
