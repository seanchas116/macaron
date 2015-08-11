import Type from "./Type";
import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

export default
class TypeThunk {
  private value: Type;

  constructor(private getter: () => Type) {
  }

  get() {
    if (!this.value) {
      this.value = this.getter();
    }
    return this.value;
  }

  static resolve(type: Type|TypeThunk) {
    if (type instanceof Type) {
      return new TypeThunk(() => type);
    }
    else if (type instanceof TypeThunk) {
      return type;
    }
  }
}
