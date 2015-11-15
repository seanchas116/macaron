import Expression from "../Expression";
import SourceRange from "../../common/SourceRange";

// TODO: improve
function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].valueType;
}

export default
class FunctionBodyExpression implements Expression {
  valueType = returnType(this.expressions);
  constructor(
    public range: SourceRange,
    public expressions: Expression[]
  ) {}
}
