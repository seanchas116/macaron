import Parser from "../parser/MacaronParser";
import {defaultEnvironment} from "../typing/defaultEnvironment";
import Environment from "../typing/Environment";
import Evaluator from "../typing/Evaluator";
import CodeEmitter from "../emitter/CodeEmitter";
import FunctionBodyExpression from "../typing/expression/FunctionBodyExpression";

interface CompileOption {
  implicitReturn? : boolean;
}

export default
class Compiler {

  compile(filePath: string, source: string, options: CompileOption = {}) {
    const parsed = new Parser(filePath, source).parse();
    const evaluator = new Evaluator(defaultEnvironment.newChild());
    let expressions = evaluator.evaluateExpressions(parsed);
    if (options.implicitReturn) {
      expressions = [new FunctionBodyExpression(expressions[0].range, expressions)];
    }

    const emitter = new CodeEmitter();
    const code = emitter.emitTopLevelExpressions(expressions);

    return code;
  }
}
