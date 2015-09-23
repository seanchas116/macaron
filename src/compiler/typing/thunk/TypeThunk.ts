import Thunk from "../Thunk";
import Type from "../Type";
import SourceLocation from "../../common/SourceLocation";

export default
class TypeThunk extends Thunk<Type> {

  static resolve(metaValue: Type|TypeThunk) {
    if (metaValue instanceof Type) {
      return new TypeThunk(SourceLocation.empty(), () => metaValue);
    }
    else if (metaValue instanceof TypeThunk) {
      return metaValue;
    }
  }

  map(f: (t: Type) => Type) {
    return new TypeThunk(this.location, () => f(this.get()));
  }
}