import MetaValue from "./MetaValue";
import MetaValueThunk from "./thunk/MetaValueThunk";

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
}
