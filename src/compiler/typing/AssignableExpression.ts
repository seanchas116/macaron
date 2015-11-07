import SourceRange from "../common/SourceRange";
import Type from "./Type";
import Identifier from "./Identifier";

export default
class AssignableExpression {
  constructor(
    public range: SourceRange,
    public type: Type
  ) {}
}

export
class IdentifierAssignableExpression extends AssignableExpression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public type: Type
  ) {
    super(range, type);
  }
}
