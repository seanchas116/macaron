import {BinaryOperatorKind, UnaryOperatorKind} from "./OperatorKind";
import CallSignature from "./CallSignature";
import Expression from "./Expression";
import Operator from "./Operator";

function mergeMap<TKey, TValue>(a: Map<TKey, TValue>, b: Map<TKey, TValue>) {
  const ret = new Map<TKey, TValue>();
  for (const [k, v] of a) {
    ret.set(k, v);
  }
  for (const [k, v] of b) {
    ret.set(k, v);
  }
  return ret;
}

function isCastableSignatures(fromSigs: CallSignature[], toSigs: CallSignature[]) {
  return toSigs.every(toSig => {
    return fromSigs.some(fromSig => fromSig.isCastableTo(toSig));
  });
}

export default
class Type {
  selfMembers = new Map<string, Type>();
  selfBinaryOperators = new Map<string, Operator>();
  selfUnaryOperators = new Map<string, Operator>();
  callSignatures: CallSignature[] = [];
  newSignatures: CallSignature[] = [];

  constructor(public name: string, public superType: Type = null, public expression: Expression = null) {
  }

  get members(): Map<string, Type> {
    if (!this.superType) {
      return this.selfMembers;
    }
    return mergeMap(this.superType.members, this.selfMembers);
  }

  get binaryOperators(): Map<string, Operator> {
    if (!this.superType) {
      return this.binaryOperators;
    }
    return mergeMap(this.superType.binaryOperators, this.selfBinaryOperators);
  }

  get unaryOperators(): Map<string , Operator> {
    if (!this.superType) {
      return this.unaryOperators;
    }
    return mergeMap(this.superType.unaryOperators, this.selfUnaryOperators);
  }

  isCastableTo(other: Type) {
    for (const [name, member] of other.members) {
      const thisMember = this.members.get(name);
      if (!thisMember || !thisMember.isCastableTo(member)) {
        return false;
      }
    }
    if (!isCastableSignatures(this.callSignatures, other.callSignatures)) {
      return false;
    }
    if (!isCastableSignatures(this.newSignatures, other.newSignatures)) {
      return false;
    }
    return true;
  }
}
