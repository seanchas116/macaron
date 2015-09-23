import Type from "../Type";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";
import CompilationError from "../../common/CompilationError";
import Member, {Constness} from "../Member";
import TypeThunk from "../thunk/TypeThunk";

function intersectionMembers(location: SourceLocation, members1: Map<string, Member>, members2: Map<string, Member>) {
  const ret = new Map<string, Member>();
  for (const [name, member1] of members1) {
    if (!members2.has(name)) {
      ret.set(name, member1);
    }
    const member2 = members2.get(name);

    const member1Type = member1.type.get();
    const member2Type = member2.type.get();

    if (member1.constness == Constness.Variable || member2.constness == Constness.Variable) {
      // nonvariant
      if (member1Type.equals(member2Type)) {
        ret.set(name, new Member(Constness.Variable, member1Type));
      } else {
        throw CompilationError.typeError(
          `Cannot make mutable intersection of ${member1Type} and {member2Type}`,
          location
        );
      }
    }

    const intersectionType = new IntersectionType([member1Type, member2Type], location);
    ret.set(name, new Member(Constness.Constant, intersectionType));
  }
  return ret;
}

export default
class IntersectionType extends Type {
  types: Type[];

  // TODO: memoize
  constructor(types: Type[], loc: SourceLocation) {
    super("", [], loc);
    const typeSet = new Set();

    for (const type of types) {
      if (type instanceof IntersectionType) {
        for (const t of type.types) {
          typeSet.add(t);
        }
      }
      else {
        typeSet.add(type);
      }
    }
    types = this.types = Array.from(typeSet);
    this.name = types.join(" & ");

    this.selfMembers = types.reduce((members, type) => {
      return intersectionMembers(loc, members, type.getMembers());
    }, new Map<string, Member>());

    this.selfCallSignatures = types.reduce((sigs, type) => sigs.concat(type.getCallSignatures()), []);
  }
}
