import defaultEnviromnent from "../typing/defaultEnvironment";
import TypeEvaluator from "../typing/TypeEvaluator";
import CodeEmitter from "../emitter/CodeEmitter";
import {ExpressionAST} from "../parser/AST";
import CompilerError from "./CompilerError";
import SourceLocation from "../parser/SourceLocation";

const parser = require("../parser/parser");

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
