import Expression, {ReturnExpression} from "../Expression";
import CompilationError from "../../common/CompilationError";
import SourceLocation from "../../common/SourceLocation";

function appendReturnType(expressions: Expression[]) {
  const len = expressions.length;
  if (len === 0) {
    return [];
  }
  const init = expressions.slice(0, len - 1);
  const last = expressions[len - 1];

  return init.concat([new ReturnExpression(last.location, last)]);
}

// TODO: improve
function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class FunctionBodyExpression extends Expression {
  expressions: Expression[];
  constructor(location: SourceLocation, expressions: Expression[]) {
    super(location);
    this.type = returnType(expressions);
    this.expressions = appendReturnType(expressions);
  }
}
