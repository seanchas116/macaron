import Type from "../Type";
import {typeOnlyType} from "../nativeTypes";

export default
class MetaType extends Type {
  constructor(public name: string, public metaType: Type, public valueType: Type = null) {
    super(name, valueType ? [valueType] : []);
  }

  static typeOnly(type: Type) {
    return new MetaType(`[type ${type.name}]`, type)
  }
}
