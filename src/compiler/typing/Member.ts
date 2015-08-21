import MetaValue from "./MetaValue";

export
enum Constness {
  Variable,
  Constant,
  Builtin
}

export default
class Member {
  constructor(public constness: Constness, public metaValue: MetaValue) {
  }
  getType() {
    return this.metaValue.type.get();
  }
}
