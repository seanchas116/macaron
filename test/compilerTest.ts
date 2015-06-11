/// <reference path="../typings/bundle.d.ts"/>

"use strict";

import assert from "power-assert";
import Compiler from "../src/Compiler";

describe("macaron", () => {
  it("should compile arithmetic expression", () => {
    const src = "1 + (2 * 3) / 2 - 6";
    const result = new Compiler().compile(src);
    const expected = "((1 + ((2 * 3) / 2)) - 6)";
    assert(src === result);
  });
});
