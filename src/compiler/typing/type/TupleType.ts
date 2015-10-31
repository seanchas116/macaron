import Type from "../Type";
import Environment from "../Environment";
import Member, {Constness} from "../Member";
import SourceRange from "../../common/SourceRange";

export default
class TupleType extends Type {
  constructor(public types: Type[], env: Environment, range: SourceRange) {
    // TODO: inherit Array
    super("", [], env, range);
    types.forEach((type, i) => {
      this.selfMembers.set(i.toString(), new Member(Constness.Constant, type));
    });
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new TupleType(this.types.map(mapper), this.environment, this.range);
  }
}
