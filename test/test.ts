/// <reference path="../typings/bundle.d.ts"/>

"use strict";

import assert from "power-assert";

describe("macaron", () => {
  it("should compile arithmetic expression", () => {
    const src = "1 + (2 * 3) / 2 - 6";
    const result = "";
    //const result = macaron.compile(src);
    assert(src === result);
  });
});
