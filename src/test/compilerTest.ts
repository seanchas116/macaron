"use strict";

import assert from "power-assert";
import Compiler from "../compiler/Compiler";

const testCases = [
  {
    title: "arithmetic expression",
    src: `
      1 + (2 * 3) / 2 - 6
    `,
    expected: `
      ((1 + ((2 * 3) / 2)) - 6);
    `
  },
  {
    title: "function call",
    src: `
      let f = (a number, b number) => {
        a + b
      }
      1 + 2 * 1 * f(1, 2)
    `,
    expected: `
      const f = (a, b) => {
        return (a + b);
      };
      (1 + ((2 * 1) * f(1, 2)));
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
