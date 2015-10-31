
export default
class SourceRange {
  constructor(public line: number, public column: number, public index: number) {
  }
  toString() {
    return `${this.line}:${this.column}`;
  }
  static empty() {
    return new SourceRange(1, 1, 0);
  }
}
