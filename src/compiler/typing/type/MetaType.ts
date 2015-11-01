import Type from "../Type";
import Environment from "../Environment";

export default
class MetaType extends Type {
  constructor(public name: string, public metaType: Type, env: Environment, public typeOnly = false) {
    super(name, [], env);
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new MetaType(this.name, mapper(this.metaType), this.environment, this.typeOnly);
  }

  static typeOnly(type: Type) {
    return new MetaType(`[type ${type.name}]`, type, type.environment, true);
  }
}
