import Type from "./Type";
import {TypeThunk} from "./Thunk";

export default
class MetaValue {
  type: TypeThunk;
  constructor(type: Type|TypeThunk, public literalValue: any = null) {
    this.type = TypeThunk.resolve(type);
  }
}
