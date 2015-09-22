import TypeThunk from "./thunk/TypeThunk";
import Type from "./Type";

export
enum Constness {
  Variable,
  Constant,
  Builtin
}

export default
class Member {
  type: TypeThunk;

  constructor(public constness: Constness, type: Type|TypeThunk) {
    this.type = TypeThunk.resolve(type);
  }

  mapType(f: (type: Type) => Type) {
    return new Member(this.constness, this.type.map(f));
  }
}
