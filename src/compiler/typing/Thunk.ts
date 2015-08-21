import Expression from "./Expression";
import Type from "./Type";
import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

export default
class Thunk<T> {
  private value: T;
  private getting = false;

  constructor(public location: SourceLocation, private getter: () => T) {
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
}

export
class ExpressionThunk extends Thunk<Expression> {
  public type: TypeThunk;

  constructor(location: SourceLocation, getter: () => Expression, type: Type = null) {
    super(location, getter);
    if (type) {
      this.type = TypeThunk.resolve(type);
    } else {
      this.type = new TypeThunk(location, () => this.get().metaValue.type.get());
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

export
class TypeThunk extends Thunk<Type> {

  static resolve(type: Type|TypeThunk) {
    if (type instanceof Type) {
      return new TypeThunk(SourceLocation.empty(), () => type);
    }
    else if (type instanceof TypeThunk) {
      return type;
    }
  }
}
