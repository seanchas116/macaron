import Thunk from "../Thunk";
import MetaValue from "../MetaValue";
import SourceLocation from "../../common/SourceLocation";

export default
class MetaValueThunk extends Thunk<MetaValue> {

  static resolve(metaValue: MetaValue|MetaValueThunk) {
    if (metaValue instanceof MetaValue) {
      return new MetaValueThunk(SourceLocation.empty(), () => metaValue);
    }
    else if (metaValue instanceof MetaValueThunk) {
      return metaValue;
    }
  }

  map(f: (m: MetaValue) => MetaValue) {
    return new MetaValueThunk(this.location, () => f(this.get()));
  }
}
