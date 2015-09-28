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
  settingType: TypeThunk;

  constructor(public constness: Constness, type: Type|TypeThunk, settingType: Type|TypeThunk = type) {
    this.type = TypeThunk.resolve(type);
    this.settingType = TypeThunk.resolve(settingType);
  }

  mapType(f: (type: Type) => Type) {
    return new Member(this.constness, this.type.map(f));
  }
}
