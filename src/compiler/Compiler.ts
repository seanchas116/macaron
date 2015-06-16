import defaultEnviromnent from "./defaultEnvironment";
import TypeEvaluator from "./TypeEvaluator";
import CodeEmitter from "./CodeEmitter";
import {ExpressionAST} from "./AST";
const parser = require("./parser");

interface CompileOption {
  implicitReturn? : boolean;
}

export default
class Compiler {

  compile(source: string, options: CompileOption = {}) {
    const parsed: ExpressionAST[] = parser.parse(source);

    const evaluator = new TypeEvaluator(defaultEnviromnent());
    const expressions = evaluator.evaluateExpressions(parsed);

    const emitter = new CodeEmitter();
    const code = emitter.emitExpressions(expressions, options.implicitReturn);

    return code;
  }
}
