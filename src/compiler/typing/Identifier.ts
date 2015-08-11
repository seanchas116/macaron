import SourceLocation from "../common/SourceLocation";

export default
class Identifier {
  constructor(public name: string, public location = SourceLocation.empty()) {
  }
}
