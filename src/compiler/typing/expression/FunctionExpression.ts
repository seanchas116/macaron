import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import FunctionBodyExpression from "./FunctionBodyExpression";
import SourceRange from "../../common/SourceRange";

interface NameType {
  name: Identifier;
  type: Type;
}

export default
class FunctionExpression extends Expression {
  constructor(range: SourceRange, public name: Identifier, type: Type, public parameters: Identifier[], public body: FunctionBodyExpression) {
    super(range);
    this.type = type;
  }
}
