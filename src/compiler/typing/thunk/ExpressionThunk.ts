import Thunk from "../Thunk";
import Type from "../Type";
import TypeThunk from "./TypeThunk";
import Expression from "../Expression";
import SourceLocation from "../../common/SourceLocation";

export default
class ExpressionThunk extends Thunk<Expression> {
  public type: TypeThunk;

  constructor(location: SourceLocation, getter: () => Expression, type: Type = null) {
    super(location, getter);
    if (type) {
      this.type= TypeThunk.resolve(type);
    } else {
      this.type= new TypeThunk(location, () => this.get().type);
    }
  }

  static resolve(expr: Expression|ExpressionThunk) {
    if (expr instanceof Expression) {
      return new ExpressionThunk(expr.location, () => expr);
    }
    else if (expr instanceof ExpressionThunk) {
      return expr;
    }
  }
}
