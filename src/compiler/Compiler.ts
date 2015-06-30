import defaultEnviromnent from "./defaultEnvironment";
import TypeEvaluator from "./TypeEvaluator";
import CodeEmitter from "./CodeEmitter";
import {ExpressionAST} from "./AST";
import CompilerError from "./CompilerError";
import SourceLocation from "./SourceLocation";

const parser = require("./parser");

interface CompileOption {
  implicitReturn? : boolean;
}

export default
class Compiler {

  compile(source: string, options: CompileOption = {}) {
    let parsed: ExpressionAST[] = [];
    try {
      parsed = parser.parse(source);
    }
    catch (error) {
      if (error.name == "SyntaxError") {
        throw CompilerError.syntaxError(
          error.message,
          new SourceLocation(error.line, error.column, error.offset)
        );
      }
    }

    const evaluator = new TypeEvaluator(defaultEnviromnent());
    const expressions = evaluator.evaluateExpressions(parsed);

    const emitter = new CodeEmitter();
    const code = emitter.emitExpressions(expressions, options.implicitReturn);

    return code;
  }
}
