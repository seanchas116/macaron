"use strict";

import assert from "power-assert";
import Compiler from "../compiler/Compiler";
import * as vm from "vm";
const babel = require("babel");

interface TestCase {
  title: string;
  src: string;
  expected?: any;
  error?: RegExp;
}

function evalIsolated(code: string) {
  const es5: string = babel.transform(code).code;
  const sandbox = {};
  const context = vm.createContext(sandbox);
  return vm.runInContext(es5, sandbox);
}

const testCases: TestCase[] = [
  {
    title: "arithmetic expression",
    src: `
      1 + (2 * 3) / 2 - 6
    `,
    expected: -2
  },
  {
    title: "function call",
    src: `
      let f = (a number, b number) => {
        a + b
      }
      1 + 2 * 1 * f(1, 2)
    `,
    expected: 7
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
        const compiled = compile();
        const func: any = evalIsolated(`
          (() => {
            ${compiled}
          })`
        );
        const result = func();
        assert.equal(result, testCase.expected);
      });
    }

    if (testCase.error != null) {
      it(`emits error on ${testCase.title}`, () => {
        assert.throws(compile, testCase.error);
      });
    }
  }
});
