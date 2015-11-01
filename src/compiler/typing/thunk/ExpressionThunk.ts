import Thunk from "../Thunk";
import Type from "../Type";
import TypeThunk from "./TypeThunk";
import Expression from "../Expression";
import SourceRange from "../../common/SourceRange";

export default
class ExpressionThunk extends Thunk<Expression> {
  public type: TypeThunk;

  constructor(range: SourceRange, getter: () => Expression, type: Type|TypeThunk = null) {
    super(range, getter);
    if (type) {
      this.type = TypeThunk.resolve(type);
    } else {
      this.type = new TypeThunk(range, () => this.get().type);
    }
  }

  map(transformExpr: (expr: Expression) => Expression, transformType: (type: Type) => Type = null) {
    return new ExpressionThunk(this.range, () => transformExpr(this.get()), this.type.map(transformType));
  }

  static resolve(expr: Expression|ExpressionThunk) {
    if (expr instanceof ExpressionThunk) {
      return expr;
    } else {
      return new ExpressionThunk(expr.range, () => <Expression>expr);
    }
  }
}
