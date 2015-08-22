import Thunk from "../Thunk";
import Expression from "../Expression";
import MetaValue from "../MetaValue";
import MetaValueThunk from "./MetaValueThunk";
import SourceLocation from "../../common/SourceLocation";

export default
class ExpressionThunk extends Thunk<Expression> {
  public metaValue: MetaValueThunk;

  constructor(location: SourceLocation, getter: () => Expression, metaValue: MetaValue = null) {
    super(location, getter);
    if (metaValue) {
      this.metaValue = MetaValueThunk.resolve(metaValue);
    } else {
      this.metaValue = new MetaValueThunk(location, () => this.get().metaValue);
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
