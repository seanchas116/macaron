import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import FunctionBodyExpression from "./FunctionBodyExpression";
import SourceRange from "../../common/SourceRange";
import AssignableExpression from "../AssignableExpression";

interface NameType {
  name: Identifier;
  type: Type;
}

export default
class FunctionExpression implements Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public type: Type,
    public parameters: AssignableExpression[],
    public body: FunctionBodyExpression
  ) {}
}
