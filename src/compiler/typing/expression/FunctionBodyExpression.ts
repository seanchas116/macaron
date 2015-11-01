import Expression, {ReturnExpression} from "../Expression";
import CompilationError from "../../common/CompilationError";
import SourceRange from "../../common/SourceRange";

// TODO: improve
function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class FunctionBodyExpression extends Expression {
  constructor(range: SourceRange, public expressions: Expression[]) {
    super(range);
    this.type = returnType(expressions);
  }
}
