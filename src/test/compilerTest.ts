"use strict";

import assert from "power-assert";
import Compiler from "../compiler/Compiler";

interface TestCase {
  title: string;
  src: string;
  expected?: string;
  error?: RegExp;
}

const testCases: TestCase[] = [
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
  },
  {
    title: "function call with wrong arguments",
    src: `
      let f = (a number) => {
        a
      }
      f(1, 2)
    `,
    error: /Cannot pass 2 arguments/
  },
  {
    title: "reference of non-existing variable",
    src: `
      a + b
    `,
    error: /No variable/
  }
];

function toLines(source: string) {
  return source.split("\n")
    .map(line => line.trim())
    .filter(line => line != "");
}

describe("Compiler", () => {

  for (const testCase of testCases) {
    const compile = () => new Compiler().compile(testCase.src, {implicitReturn: true});

    if (testCase.expected != null) {
      it(`compiles ${testCase.title}`, () => {

        const result = toLines(compile());
        const expected = toLines(testCase.expected);
        assert.deepEqual(result, expected);
      });
    }

    if (testCase.error != null) {
      it(`emits error on ${testCase.title}`, () => {
        assert.throws(compile, testCase.error);
      });
    }
  }
});
