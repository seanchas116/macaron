import Expression, {ReturnExpression} from "../Expression";
import MetaValue from "../MetaValue";
import CompilationError from "../../common/CompilationError";
import SourceLocation from "../../common/SourceLocation";

// TODO: improve
function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].getType();
}

export default
class FunctionBodyExpression extends Expression {
  constructor(location: SourceLocation, public expressions: Expression[]) {
    super(location);
    this.metaValue = new MetaValue(returnType(expressions));
  }
}
