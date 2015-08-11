
export default
class SourceLocation {
  constructor(public line: number, public column: number, public offset: number) {
  }
  toString() {
    return `${this.line}:${this.column}`;
  }
  static empty() {
    return new SourceLocation(1, 1, 0);
  }
}
