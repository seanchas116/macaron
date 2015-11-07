export default class SourcePosition {
    constructor(filePath, index, line, column) {
        this.filePath = filePath;
        this.index = index;
        this.line = line;
        this.column = column;
    }
    toString() {
        return `${this.filePath}:${this.line}:${this.column}`;
    }
}
