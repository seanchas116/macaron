import SourceRange from "../common/SourceRange";
import Type from "./Type";

export default
class AssignableExpression {
  range: SourceRange;
  type: Type;
}

export
class IdentifierAssignbleExpression extends AssignableExpression {
  constructor(
    public range: SourceRange,
    public name: string,
    public type: Type
  ) {
    super();
  }
}
