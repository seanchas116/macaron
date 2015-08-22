import Thunk from "../Thunk";
import Type from "../Type";
import SourceLocation from "../../common/SourceLocation";

export default
class TypeThunk extends Thunk<Type> {

  static resolve(type: Type|TypeThunk) {
    if (type instanceof Type) {
      return new TypeThunk(SourceLocation.empty(), () => type);
    }
    else if (type instanceof TypeThunk) {
      return type;
    }
  }
}
