import Type from "./Type";

export default
class MetaValue {
  constructor(public valueType: Type, public metaType: Type = null) {
  }

  mapType(f: (type: Type) => Type) {
    return new MetaValue(f(this.valueType), this.metaType && f(this.metaType));
  }
}
