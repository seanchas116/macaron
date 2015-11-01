import Expression, {ReturnExpression} from "../Expression";
import CompilationError from "../../common/CompilationError";
import SourceRange from "../../common/SourceRange";

// TODO: improve
function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class FunctionBodyExpression extends Expression {
  type = returnType(this.expressions);
  constructor(
    public range: SourceRange,
    public expressions: Expression[]
  ) {
    super();
  }
}
