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

    const evaluator = new TypeEvaluator(defaultEnviromnent());
    const expressions = evaluator.evaluateExpressions(parsed);

    const emitter = new CodeEmitter();
    const code = expressions.map(expr => emitter.emitCode(expr) + ";\n").join();

    return code;
  }
}
