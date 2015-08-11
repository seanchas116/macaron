import Parser from "../parser/Parser";
import defaultEnviromnent from "../typing/defaultEnvironment";
import TypeEvaluator from "../typing/TypeEvaluator";
import CodeEmitter from "../emitter/CodeEmitter";

interface CompileOption {
  implicitReturn? : boolean;
}

export default
class Compiler {

  compile(source: string, options: CompileOption = {}) {
    const parsed = new Parser(source).parse();
    const evaluator = new TypeEvaluator(defaultEnviromnent());
    const expressions = evaluator.evaluateExpressions(parsed).map(e => e.get());

    const emitter = new CodeEmitter();
    const code = emitter.emitExpressions(expressions, options.implicitReturn);

    return code;
  }
}
