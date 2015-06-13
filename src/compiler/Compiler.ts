declare function require(path: string): any;

import defaultEnviromnent from "./defaultEnvironment";
import TypeEvaluator from "./TypeEvaluator";
import CodeEmitter from "./CodeEmitter";
import {ExpressionAST} from "./AST";
const parser = require("./parser");

export default
class Compiler {

  compile(source: string) {
    const parsed: ExpressionAST[] = parser.parse(source);

    const env = defaultEnviromnent();
    const evaluator = new TypeEvaluator();

    const expressions = parsed.map(ast => evaluator.evaluate(ast, env));

    const emitter = new CodeEmitter();
    const code = expressions.map(expr => emitter.emitCode(expr) + ";\n").join();

    return code;
  }
}
