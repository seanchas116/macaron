import Type from "../Type";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";
import Member, {Constness} from "../Member";
import TypeThunk from "../thunk/TypeThunk";

function unionMembers(type: UnionType, members1: Map<string, Member>, members2: Map<string, Member>) {
  const ret = new Map<string, Member>();
  for (const [name, member1] of members1) {
    if (!members2.has(name)) {
      continue;
    }
    const member2 = members2.get(name);
    if (member1.constness == Constness.Variable || member2.constness == Constness.Variable) {
      // nonvariant
      if (member1.type.get().equals(member2.type.get())) {
        ret.set(name, new Member(Constness.Variable, member1.type));
      }
    }

    const unionType = new TypeThunk(type.location, () => {
      return new UnionType([member1.type.get(), member2.type.get()], type.location);
    });
    ret.set(name, new Member(Constness.Constant, unionType));
  }
  return ret;
}

function unionOperators(type: UnionType, operators1: Map<string, Operator>, operators2: Map<string, Operator>) {
  const ret = new Map<string, Operator>();
  for (const [name, op1] of operators1) {
    if (!operators2.has(name)) {
      continue;
    }
    const op2 = operators2.get(name);
    if (op1 instanceof MethodOperator && op2 instanceof MethodOperator) {
      if (op1.methodName == op2.methodName) {
        ret.set(name, new MethodOperator(type, op1.methodName));
      }
    }
    else if (op1 instanceof NativeOperator && op2 instanceof NativeOperator) {
      if (op1.nativeOperatorName === op2.nativeOperatorName) {
        ret.set(name, new NativeOperator(op1.nativeOperatorName, type));
      }
    }
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
      return unionMembers(this, members, type.getMembers());
    }, new Map<string, Member>());

    this.selfUnaryOperators = types.reduce((operators, type) => {
      return unionOperators(this, operators, type.getUnaryOperators());
    }, new Map<string, Operator>());

    this.selfBinaryOperators = types.reduce((operators, type) => {
      return unionOperators(this, operators, type.getBinaryOperators());
    }, new Map<string, Operator>());

    this.selfCallSignatures = types.reduce((sigs, type) => {
      return unionCallSignatures(this, sigs, type.getCallSignatures());
    }, []);
  }
}
