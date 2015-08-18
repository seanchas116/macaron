import Type from "../Type";
import {TypeThunk} from "../Thunk";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";

function unionMembers(type: UnionType, members1: Map<string, TypeThunk>, members2: Map<string, TypeThunk>) {
  const ret = new Map<string, TypeThunk>();
  for (const [name, type1] of members1) {
    if (!members2.has(name)) {
      continue;
    }
    const type2 = members2.get(name);
    ret.set(name, new TypeThunk(type.location, () => {
      return new UnionType([type1.get(), type2.get()], type.location);
    }));
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
        ret.set(name, new MethodOperator(TypeThunk.resolve(type), op1.methodName));
      }
    }
    else if (op1 instanceof NativeOperator && op2 instanceof NativeOperator) {
      if (op1.nativeOperatorName === op2.nativeOperatorName) {
        ret.set(name, new NativeOperator(op1.nativeOperatorName, TypeThunk.resolve(type)));
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
        const returnType = new TypeThunk(type.location, () => {
          return new UnionType([sig1.returnType.get(), sig2.returnType.get()], type.location);
        });
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
    super("", null, loc);
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
    }, new Map<string, TypeThunk>());

    this.selfUnaryOperators = types.reduce((operators, type) => {
      return unionOperators(this, operators, type.getUnaryOperators());
    }, new Map<string, Operator>());

    this.selfBinaryOperators = types.reduce((operators, type) => {
      return unionOperators(this, operators, type.getBinaryOperators());
    }, new Map<string, Operator>());

    this.callSignatures = types.reduce((sigs, type) => {
      return unionCallSignatures(this, sigs, type.callSignatures);
    }, []);
  }
}
