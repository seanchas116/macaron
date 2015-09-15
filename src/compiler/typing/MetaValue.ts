import Type from "./Type";

export default
class MetaValue {
  constructor(public valueType: Type, public metaType: Type = null) {
  }
}
