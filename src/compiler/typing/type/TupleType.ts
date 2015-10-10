import Type from "../Type";
import Environment from "../Environment";
import Member, {Constness} from "../Member";
import SourceLocation from "../../common/SourceLocation";

export default
class TupleType extends Type {
  constructor(public types: Type[], env: Environment, loc: SourceLocation) {
    // TODO: inherit Array
    super("", [], env, loc);
    types.forEach((type, i) => {
      this.selfMembers.set(i.toString(), new Member(Constness.Constant, type));
    });
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new TupleType(this.types.map(mapper), this.environment, this.location);
  }
}
