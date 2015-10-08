import Type from "../Type";
import Member, {Constness} from "../Member";
import SourceLocation from "../../common/SourceLocation";

export default
class TupleType extends Type {
  constructor(public types: Type[], loc: SourceLocation) {
    super("", loc);
    types.forEach((type, i) => {
      this.members.set(i.toString(), new Member(Constness.Constant, type));
    });
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new TupleType(this.types.map(mapper), this.location);
  }
}
