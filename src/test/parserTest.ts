import parseNumber from "../compiler/parser/parsing/number";
import assert from "power-assert";

describe("Parser", () => {
  it("parses float number", () => {
    const ast = parseNumber.parse("123.123e-5");
    assert(ast.value == 123.123e-5);
    assert(ast.location.line == 1);
    assert(ast.location.column == 1);
  });
});
