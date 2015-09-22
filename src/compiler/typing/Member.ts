import MetaValue from "./MetaValue";
import MetaValueThunk from "./thunk/MetaValueThunk";
import Type from "./Type";

export
enum Constness {
  Variable,
  Constant,
  Builtin
}

export default
class Member {
  metaValue: MetaValueThunk;

  constructor(public constness: Constness, metaValue: MetaValue|MetaValueThunk) {
    this.metaValue = MetaValueThunk.resolve(metaValue);
  }

  getType() {
    return this.metaValue.get().valueType;
  }

  mapType(f: (type: Type) => Type) {
    return new Member(this.constness, this.metaValue.get().mapType(f));
  }
}
