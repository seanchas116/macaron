import Type from "../Type";
import IntersectionType from "./IntersectionType";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";
import Member, {Constness} from "../Member";
import TypeThunk from "../thunk/TypeThunk";

function unionMembers(location: SourceLocation, members1: Map<string, Member>, members2: Map<string, Member>) {
  const ret = new Map<string, Member>();
  for (const [name, member1] of members1) {
    if (!members2.has(name)) {
      continue;
    }
    const member2 = members2.get(name);

    const member1Type = member1.type.get();
    const member2Type = member2.type.get();

    if (member1.constness == Constness.Variable || member2.constness == Constness.Variable) {
      // nonvariant
      if (member1Type.equals(member2Type)) {
        ret.set(name, new Member(Constness.Variable, member1Type));
      }
    }

    const unionType = new UnionType([member1Type, member2Type], location);
    ret.set(name, new Member(Constness.Constant, unionType));
  }
  return ret;
}

function unionCallSignatures(location: SourceLocation, signatures1: CallSignature[], signatures2: CallSignature[]) {
  const signatures: CallSignature[] = [];

  for (const sig1 of signatures1) {
    const sigs2 = signatures2.filter(s => s.params.length == sig1.params.length);
    for (const sig2 of sigs2) {
      signatures.push(new CallSignature(
        new IntersectionType([sig1.selfType, sig2.selfType], location),
        sig1.params.map((p, i) => new IntersectionType([p, sig2.params[i]], location)),
        new UnionType([sig1.returnType, sig2.returnType], location)
      ));
    }
  }
  return signatures;
}

export default
class UnionType extends Type {
  types: Type[];

  // TODO: memoize
  constructor(types: Type[], loc: SourceLocation) {
    super("", [], loc);
    const typeSet = new Set();

    for (const type of types) {
      if (type instanceof UnionType) {
        for (const t of type.types) {
          typeSet.add(t);
        }
      }
      else {
        typeSet.add(type);
      }
    }
    types = this.types = Array.from(typeSet);
    this.name = types.join("|");

    this.selfMembers = types.reduce((members, type) => {
      return unionMembers(loc, members, type.getMembers());
    }, new Map<string, Member>());

    this.selfCallSignatures = types.reduce((sigs, type) => {
      return unionCallSignatures(loc, sigs, type.getCallSignatures());
    }, []);
  }
}
