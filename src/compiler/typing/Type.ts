import CallSignature from "./CallSignature";
import Expression from "./Expression";
import Operator from "./Operator";
import {TypeThunk} from "./Thunk";
import {voidType} from "./nativeTypes";

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
  selfMembers = new Map<string, TypeThunk>();
  selfBinaryOperators = new Map<string, Operator>();
  selfUnaryOperators = new Map<string, Operator>();
  callSignatures: CallSignature[] = [];
  newSignatures: CallSignature[] = [];

  constructor(public name: string, public superType: Type = null, public expression: Expression = null) {
  }

  toString() {
    return this.name;
  }

  addMember(name: string, type: Type|TypeThunk) {
    this.selfMembers.set(name, TypeThunk.resolve(type));
  }

  getMember(name: string): TypeThunk {
    if (this.superType) {
      const member = this.superType.getMember(name);
      if (member) {
        return member;
      }
    }
    return this.selfMembers.get(name);
  }

  getMembers(): Map<string, TypeThunk> {
    if (!this.superType) {
      return this.selfMembers;
    }
    return mergeMap(this.superType.getMembers(), this.selfMembers);
  }

  getBinaryOperators(): Map<string, Operator> {
    if (!this.superType) {
      return this.selfBinaryOperators;
    }
    return mergeMap(this.superType.getBinaryOperators(), this.selfBinaryOperators);
  }

  getUnaryOperators(): Map<string , Operator> {
    if (!this.superType) {
      return this.selfUnaryOperators;
    }
    return mergeMap(this.superType.getUnaryOperators(), this.selfUnaryOperators);
  }

  isCastableTo(other: Type) {
    if (this === other) {
      return true;
    }
    for (const [name, member] of other.getMembers()) {
      const thisMember = this.getMember(name).get();
      if (!thisMember || !thisMember.isCastableTo(member.get())) {
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
