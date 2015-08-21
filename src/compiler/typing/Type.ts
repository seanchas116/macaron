import CallSignature from "./CallSignature";
import Expression from "./Expression";
import Operator from "./Operator";
import Member from "./Member";
import {TypeThunk} from "./Thunk";
import {voidType} from "./nativeTypes";
import SourceLocation from "../common/SourceLocation";
const HashMap = require("hashmap");

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

const castResults: Map<[Type, Type], boolean> = new HashMap();

export default
class Type {
  selfMembers = new Map<string, Member>();
  selfBinaryOperators = new Map<string, Operator>();
  selfUnaryOperators = new Map<string, Operator>();
  callSignatures: CallSignature[] = [];
  newSignatures: CallSignature[] = [];

  constructor(public name: string, public superType: Type = null, public location: SourceLocation = null, public expression: Expression = null) {
    this.location = location || SourceLocation.empty();
  }

  toString() {
    return this.name;
  }

  addMember(name: string, member: Member) {
    this.selfMembers.set(name, member);
  }

  getMember(name: string): Member {
    if (this.superType) {
      const member = this.superType.getMember(name);
      if (member) {
        return member;
      }
    }
    return this.selfMembers.get(name);
  }

  getMembers(): Map<string, Member> {
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

    const memoizedResult = castResults.get([this, other]);
    if (memoizedResult != null) {
      return memoizedResult;
    }
    castResults.set([this, other], true); // temporarily set to true to avoid infinite recursion
    const result = this.isCastableToImpl(other);
    castResults.set([this, other], result);
    return result;
  }

  equals(other: Type) {
    return this.isCastableTo(other) && other.isCastableTo(this);
  }

  private isCastableToImpl(other: Type) {
    for (const [name, member] of other.getMembers()) {
      const thisMember = this.getMember(name).getType();
      if (!thisMember || !thisMember.isCastableTo(member.getType())) {
        return false;
      }
    }
    if (!CallSignature.isCastableTo(this.callSignatures, other.callSignatures)) {
      return false;
    }
    if (!CallSignature.isCastableTo(this.newSignatures, other.newSignatures)) {
      return false;
    }
    return true;
  }
}
