import Type from "./Type";

export default
class MetaValue {
  constructor(public type: Type, public literalValue: any = null, public metaType: Type = null) {
  }
}
