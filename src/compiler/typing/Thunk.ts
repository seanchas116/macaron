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
}
