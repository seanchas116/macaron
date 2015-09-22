import Type from "../Type";
import Member, {Constness} from "../Member";
import SourceLocation from "../../common/SourceLocation";

export default
class TupleType extends Type {
  constructor(types: Type[], loc: SourceLocation) {
    super("", [], loc);
    types.forEach((type, i) => {
      this.addMember(i.toString(), new Member(Constness.Constant, type));
    });
  }
}
