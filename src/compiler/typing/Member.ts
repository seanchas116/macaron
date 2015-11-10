import Thunk from "./Thunk";
import Type from "./Type";

export
enum Constness {
  Variable,
  Constant,
  Builtin
}

export default
class Member {
  type: Thunk<Type>;
  settingType: Thunk<Type>;

  constructor(public constness: Constness, type: Type|Thunk<Type>, settingType: Type|Thunk<Type> = type) {
    this.type = Thunk.resolve(type);
    this.settingType = Thunk.resolve(settingType);
  }

  mapType(f: (type: Type) => Type) {
    return new Member(this.constness, this.type.map(f));
  }
}
