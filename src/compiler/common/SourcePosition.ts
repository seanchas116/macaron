
export default
class SourcePosition {
  constructor(
    public filePath: string,
    public index: number,
    public line: number,
    public column: number
  ) {}

  toString() {
    return `${this.filePath}:${this.line}:${this.column}`;
  }
}
