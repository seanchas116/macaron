import SourcePosition from "./SourcePosition";

export default
class SourceRange {
  constructor(public begin: SourcePosition, public end: SourcePosition) {
  }
  static empty() {
    return new SourceRange(
      new SourcePosition("", 0, 1, 1),
      new SourcePosition("", 0, 1, 1)
    );
  }
}
