import Type from "../Type";
import SourceLocation from "../../common/SourceLocation";

export default
class TupleType extends Type {
  constructor(types: Type[], loc: SourceLocation) {
    super("", null, loc);
    types.forEach((type, i) => {
      this.addMember(i.toString(), type);
    });
  }
}
