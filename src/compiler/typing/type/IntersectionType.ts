import Type from "../Type";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import CompilationError from "../../common/CompilationError";
import Member, {Constness} from "../Member";
import Environment from "../Environment";
import SourceRange from "../../common/SourceRange";
import {union} from "../../util/set";

function intersectionMembers(
  environment: Environment, range: SourceRange,
  members1: Map<string, Member>, members2: Map<string, Member>
) {
  const ret = new Map<string, Member>();
  const names = union(new Set(members1.keys()), new Set(members2.keys()));

  for (const name of names) {
    const member1 = members1.get(name);
    const member2 = members2.get(name);

    if (!member2) {
      ret.set(name, member1);
      continue;
    }
    if (!member1) {
      ret.set(name, member2);
      continue;
    }

    const member1Type = member1.type.get();
    const member2Type = member2.type.get();

    if (member1.constness == Constness.Variable || member2.constness == Constness.Variable) {
      // nonvariant
      if (member1Type.equals(member2Type, [])) {
        ret.set(name, new Member(Constness.Variable, member1Type));
      } else {
        throw CompilationError.typeError(
          range,
          `Cannot make mutable intersection of ${member1Type} and {member2Type}`
        );
      }
    }

    const intersectionType = new IntersectionType([member1Type, member2Type], environment, range);
    ret.set(name, new Member(Constness.Constant, intersectionType));
  }
  return ret;
}

export default
class IntersectionType extends Type {
  types: Type[];
  private members: Map<string, Member>;
  private callSignatures: CallSignature[];

  // TODO: memoize
  constructor(types: Type[], env: Environment, range: SourceRange) {
    super("", env, range);
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

    this.members = types.reduce((members, type) => {
      return intersectionMembers(env, range, members, type.getMembers());
    }, new Map<string, Member>());

    this.callSignatures = types.reduce((sigs, type) => sigs.concat(type.getCallSignatures()), []);
  }

  getMembers() {
    return this.members;
  }
  getMember(name: string) {
    return this.members.get(name);
  }
  getCallSignatures() {
    return this.callSignatures;
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new IntersectionType(this.types.map(mapper), this.environment, this.range);
  }
}
