import Expression from "./Expression";
import TypeThunk from "./TypeThunk";
import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

export default
class ExpressionThunk {
  private value: Expression;
  private getting = false;

  constructor(public location: SourceLocation, private getter: () => Expression) {
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

  getType() {
    return new TypeThunk(() => this.get().type);
  }

  static resolved(expr: Expression) {
    return new ExpressionThunk(expr.location, () => expr);
  }
}
