import Thunk from "../Thunk";
import Type from "../Type";
import SourceRange from "../../common/SourceRange";

export default
class TypeThunk extends Thunk<Type> {

  static resolve(metaValue: Type|TypeThunk) {
    if (metaValue instanceof Type) {
      return new TypeThunk(SourceRange.empty(), () => metaValue);
    }
    else if (metaValue instanceof TypeThunk) {
      return metaValue;
    }
  }

  map(f: (t: Type) => Type) {
    return new TypeThunk(this.range, () => f(this.get()));
  }
}
