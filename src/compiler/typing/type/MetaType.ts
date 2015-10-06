import Type from "../Type";

export default
class MetaType extends Type {
  constructor(public name: string, public metaType: Type, public typeOnly = false) {
    super(name);
  }

  static typeOnly(type: Type) {
    return new MetaType(`[type ${type.name}]`, type, true);
  }
}
