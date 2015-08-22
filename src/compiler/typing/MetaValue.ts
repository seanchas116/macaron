import Type from "./Type";
import TypeThunk from "./thunk/TypeThunk";

export default
class MetaValue {
  type: TypeThunk;
  metaType: TypeThunk;
  constructor(type: Type|TypeThunk, public literalValue: any = null, metaType: Type|TypeThunk = null) {
    this.type = TypeThunk.resolve(type);
    this.metaType = TypeThunk.resolve(metaType);
  }
}
