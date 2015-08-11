import Expression from "./Expression";
import TypeThunk from "./TypeThunk";
import Type from "./Type";
import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

export default
class ExpressionThunk {
  private value: Expression;
  private getting = false;
  public type: TypeThunk;

  constructor(public location: SourceLocation, private getter: () => Expression, type: Type = null) {
    if (type) {
      this.type = TypeThunk.resolve(type);
    } else {
      this.type = new TypeThunk(() => this.get().type);
    }
  }

  get() {
    if (this.getting) {
      throw CompilationError.typeError(
        `Recursion detected while resolving type`,
        this.location
      );
    }
    if (!this.value) {
      this.getting = true;
      this.value = this.getter();
      this.getting = false;
    }
    return this.value;
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
