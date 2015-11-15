"use strict";

import assert from "power-assert";
import Compiler from "../compiler/compiler/Compiler";
import * as vm from "vm";
import loadPatterns from "./support/loadPattern";
const babel = require("babel");
const lineNumbers = require("line-numbers");
const escapeStringRegexp = require('escape-string-regexp');

function evalIsolated(code: string) {
  const es5: string = babel.transform(code).code;
  const sandbox = {};
  vm.createContext(sandbox);
  return vm.runInContext(es5, sandbox);
}

describe("Compiler", () => {

  const patterns = loadPatterns();

  for (const {src, title, error, expected} of patterns) {
    const compile = () => new Compiler().compile("[test source]", src, {implicitReturn: true});

    if (expected != null) {
      it(`compiles ${title}`, () => {
        console.log("== Source");
        console.log(lineNumbers(src));

        const compiled = compile();

        console.log("== Compiled");
        console.log(lineNumbers(compiled));

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
        assert.throws(compile, new RegExp(escapeStringRegexp(error)));
      });
    }
  }
});
