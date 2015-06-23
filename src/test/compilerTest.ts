"use strict";

import assert from "power-assert";
import Compiler from "../compiler/Compiler";
import * as vm from "vm";
import loadPatterns from "./support/loadPattern";
const babel = require("babel");

function evalIsolated(code: string) {
  const es5: string = babel.transform(code).code;
  const sandbox = {};
  const context = vm.createContext(sandbox);
  return vm.runInContext(es5, sandbox);
}

function toLines(source: string) {
  return source.split("\n")
    .map(line => line.trim())
    .filter(line => line != "");
}

describe("Compiler", () => {

  const patterns = loadPatterns();

  for (const {src, title, error, expected} of patterns) {
    const compile = () => new Compiler().compile(src, {implicitReturn: true});

    if (expected != null) {
      it(`compiles ${title}`, () => {
        const compiled = compile();
        const func: any = evalIsolated(`
          (() => {
            ${compiled}
          })`
        );
        const result = func();
        assert.equal(result, expected);
      });
    }

    if (error != null) {
      it(`emits error on ${title}`, () => {
        assert.throws(compile, error);
      });
    }
  }
});
