import Parser from "../parser/Parser";
import defaultEnviromnent from "../typing/defaultEnvironment";
import Evaluator from "../typing/Evaluator";
import CodeEmitter from "../emitter/CodeEmitter";
import FunctionBodyExpression from "../typing/expression/FunctionBodyExpression";

interface CompileOption {
  implicitReturn? : boolean;
}

export default
class Compiler {

  compile(source: string, options: CompileOption = {}) {
    const parsed = new Parser(source).parse();
    const evaluator = new Evaluator(defaultEnviromnent());
    let expressions = evaluator.evaluateExpressions(parsed).map(e => e.get());
    if (options.implicitReturn) {
      expressions = [new FunctionBodyExpression(expressions[0].location, expressions)];
    }

    const emitter = new CodeEmitter();
    const code = emitter.emitTopLevelExpressions(expressions);

    return code;
  }
}
