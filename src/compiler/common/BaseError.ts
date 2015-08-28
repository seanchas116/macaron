import * as util from "util";

// TODO: extends Error
export default
class BaseError implements Error {
  name = "BaseError";
  message = "";
  error: Error;

  get stack() {
    return this.error["stack"];
  }

  constructor() {
    this.error = new Error();
  }
}

util.inherits(BaseError, Error);
