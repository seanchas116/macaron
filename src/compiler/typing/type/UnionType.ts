import Type from "../Type";
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

function deepEqual<T>(xs: T[], ys: T[]) {
  return xs.every((x, i) => x === ys[i]);
}

function unionCallSignatures(type: UnionType, signatures1: CallSignature[], signatures2: CallSignature[]) {
  const signatures: CallSignature[] = [];

  for (const sig1 of signatures1) {
    for (const sig2 of signatures2) {
      // TODO: intersection type
      if (deepEqual(sig1.params, sig2.params) && sig1.selfType === sig2.selfType) {
        const returnType = new UnionType([sig1.returnType, sig2.returnType], type.location);
        signatures.push(new CallSignature(sig1.selfType, sig1.params, returnType));
      }
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
      return unionCallSignatures(this, sigs, type.getCallSignatures());
    }, []);
  }
}
