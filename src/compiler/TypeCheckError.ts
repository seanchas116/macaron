import SourceLocation from "./SourceLocation";


// TODO: subclass Error
export default
class TypeCheckError implements Error {
  name = "TypeCheckError";
  message: string;
  stack: any;

  constructor(message: string, public location: SourceLocation) {
    var error = new Error(message);
    this.message = error.message;
    this.stack = error["stack"];
  }
}
