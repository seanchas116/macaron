import SourceRange from "../common/SourceRange";
import CompilationError from "../common/CompilationError";

export default
class Thunk<T> {
  private value: T;
  private getting = false;

  constructor(public range: SourceRange, private getter: () => T) {
  }

  get() {
    if (this.getting) {
      throw CompilationError.typeError(
        this.range,
        `Recursion detected while resolving type`
      );
    }
    if (!this.value) {
      this.getting = true;
      this.value = this.getter();
      this.getting = false;
    }
    return this.value;
  }

  map<U>(f: (value: T) => U) {
    return new Thunk(this.range, () => f(this.value));
  }

  static resolve<U>(value: U|Thunk<U>) {
    if (value instanceof Thunk) {
      return value;
    } else {
      return new Thunk<U>(null, () => value as U);
    }
  }
}
