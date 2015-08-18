import Expression, {ReturnExpression} from "../Expression";
import CompilationError from "../../common/CompilationError";
import SourceLocation from "../../common/SourceLocation";

// TODO: improve
function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class FunctionBodyExpression extends Expression {
  constructor(location: SourceLocation, public expressions: Expression[]) {
    super(location);
    this.type = returnType(expressions);
  }
}
