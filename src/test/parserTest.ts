import {parseNumberLiteral} from "../compiler/parser/parsing/number";
import assert from "power-assert";

describe("Parser", () => {
  it("parses float number", () => {
    const ast = parseNumberLiteral.parse("123.123e-5");
    assert(ast.value == 123.123e-5);
    assert(ast.range.line == 1);
    assert(ast.range.column == 1);
  });
});
