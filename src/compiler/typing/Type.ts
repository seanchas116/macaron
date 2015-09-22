import CallSignature from "./CallSignature";
import Expression from "./Expression";
import Operator from "./Operator";
import Member, {Constness} from "./Member";
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
  selfCallSignatures: CallSignature[] = null;
  selfNewSignatures: CallSignature[] = null;

  constructor(public name: string, public superTypes: Type[] = [], public location: SourceLocation = null, public expression: Expression = null) {
    this.location = location || SourceLocation.empty();
  }

  toString() {
    return this.name;
  }

  addMember(name: string, member: Member) {
    this.selfMembers.set(name, member);
  }

  getMember(name: string): Member {
    for (const superType of this.superTypes) {
      const member = superType.getMember(name);
      if (member) {
        return member;
      }
    }
    return this.selfMembers.get(name);
  }

  getMembers(): Map<string, Member> {
    return [...this.superTypes.map(t => t.getMembers()), this.selfMembers]
      .reduce(mergeMap);
  }

  getBinaryOperators(): Map<string, Operator> {
    return [...this.superTypes.map(t => t.getBinaryOperators()), this.selfBinaryOperators]
      .reduce(mergeMap);
  }

  getUnaryOperators(): Map<string , Operator> {
    return [...this.superTypes.map(t => t.getUnaryOperators()), this.selfUnaryOperators]
      .reduce(mergeMap);
  }

  getCallSignatures(): CallSignature[] {
    if (this.selfCallSignatures) {
      return this.selfCallSignatures;
    } else {
      return this.superTypes
        .map(t => t.getCallSignatures())
        .reduce((a, b) => a.concat(b), []);
    }
  }

  getNewSignatures(): CallSignature[] {
    if (this.selfNewSignatures) {
      return this.selfNewSignatures;
    } else {
      return this.superTypes
        .map(t => t.getNewSignatures())
        .reduce((a, b) => a.concat(b), []);
    }
  }

  isAssignable(other: Type): boolean {
    if (this === other) {
      return true;
    }

    const memoizedResult = castResults.get([this, other]);
    if (memoizedResult != null) {
      return memoizedResult;
    }
    castResults.set([this, other], true); // temporarily set to true to avoid infinite recursion
    const result = this.isAssignableImpl(other);
    castResults.set([this, other], result);
    return result;
  }

  equals(other: Type) {
    return this.isAssignable(other) && other.isAssignable(this);
  }

  protected isAssignableImpl(other: Type) {
    for (const [name, memberThis] of this.getMembers()) {
      const memberOther = other.getMember(name);
      if (!memberOther) {
        return false;
      }
      if (memberThis.constness == Constness.Variable) {
        // nonvariant
        if (!memberOther.type.get().equals(memberThis.type.get())) {
          return false;
        }
      }
      else {
        // covariant
        if (!memberThis.type.get().isAssignable(memberOther.type.get())) {
          return false;
        }
      }
    }
    if (!CallSignature.isAssignable(this.getCallSignatures(), other.getCallSignatures())) {
      return false;
    }
    if (!CallSignature.isAssignable(this.getNewSignatures(), other.getNewSignatures())) {
      return false;
    }
    return true;
  }
}
