"use strict";

const assert = require("power-assert");
const macaron = require("..");

describe("macaron", () => {
  it("should compile arithmetic expression", () => {
    const src = "1 + (2 * 3) / 2 - 6";
    const result = macaron.compile(src);
    assert(src === result);
  });
});
