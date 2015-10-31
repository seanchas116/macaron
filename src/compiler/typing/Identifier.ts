import SourceRange from "../common/SourceRange";

export default
class Identifier {
  constructor(public name: string, public range = SourceRange.empty()) {
  }
  toString() {
    return this.name;
  }
}
