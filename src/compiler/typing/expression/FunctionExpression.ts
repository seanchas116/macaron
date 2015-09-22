import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import FunctionBodyExpression from "./FunctionBodyExpression";
import SourceLocation from "../../common/SourceLocation";

interface NameType {
  name: Identifier;
  type: Type;
}

export default
class FunctionExpression extends Expression {
  constructor(location: SourceLocation, public name: Identifier, type: Type, public parameters: Identifier[], public body: FunctionBodyExpression) {
    super(location);
    this.type = type;
  }
}
