import SourcePosition from "./SourcePosition";
export default class SourceRange {
    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }
    static empty() {
        return new SourceRange(new SourcePosition("", 0, 1, 1), new SourcePosition("", 0, 1, 1));
    }
}
