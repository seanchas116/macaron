
export default
class SourceLocation {
  line: Number;
  column: Number;
  offset: Number;

  constructor(line: Number, column: Number, offset: Number) {
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
}
