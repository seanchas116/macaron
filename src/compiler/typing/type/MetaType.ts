import Type from "../Type";

export default
class MetaType extends Type {
  constructor(public name: string, public metaType: Type, public typeOnly = false) {
    super(name);
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new MetaType(this.name, mapper(this.metaType), this.typeOnly);
  }

  static typeOnly(type: Type) {
    return new MetaType(`[type ${type.name}]`, type, true);
  }
}
