/// <reference path="../typings/bundle.d.ts"/>

"use strict";

import assert from "power-assert";
import Compiler from "../src/Compiler";

const testCases = [
  {
    title: "arithmetic expression",
    src: `
      1 + (2 * 3) / 2 - 6
    `,
    expected: `
      ((1 + ((2 * 3) / 2)) - 6)
    `
  }
];

describe("Compiler", () => {

  for (const testCase of testCases) {
    it(`should compile ${testCase.title}`, () => {
      const result = new Compiler().compile(testCase.src).trim();
      const expected = testCase.expected.trim();
      assert(result === expected);
    });
  }
});
