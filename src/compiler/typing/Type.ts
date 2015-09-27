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

export
interface Assignability {
  assignable: boolean;
  reasons: string[];
}

const assignabilityResults: Map<[Type, Type], Assignability> = new HashMap();

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

  isAssignable(other: Type, reasons: string[]) {
    if (this === other) {
      return true;
    }

    const memoized = assignabilityResults.get([this, other]);
    if (memoized != null) {
      reasons.push(...memoized.reasons);
      return memoized.assignable;
    }
    assignabilityResults.set([this, other], {
      assignable: true,
      reasons: []
    }); // temporarily set to true to avoid infinite recursion

    const assignable = this.isAssignableUncached(other, reasons);

    assignabilityResults.set([this, other], {
      assignable: assignable,
      reasons: Array.from(reasons)
    });
    return assignable;
  }

  equals(other: Type, reasons: string[]) {
    return this.isAssignable(other, reasons) && other.isAssignable(this, reasons);
  }

  isAssignableUncached(other: Type, reasons: string[]): boolean {
    for (const [name, memberThis] of this.getMembers()) {
      const memberOther = other.getMember(name);
      if (!memberOther) {
        reasons.push(`Type '${other}' do not have member '${name}'`);
        return false;
      }
      const typeThis = memberThis.type.get();
      const typeOther = memberOther.type.get();
      if (memberThis.constness == Constness.Variable) {
        // nonvariant
        if (!typeOther.equals(typeThis, reasons)) {
          reasons.push(`Member '${name}': '${typeOther}' is not equal to '${typeThis}'`);
          return false;
        }
      }
      else {
        // covariant
        if (!memberThis.type.get().isAssignable(memberOther.type.get(), reasons)) {
          reasons.push(`Member '${name}': '${typeOther}' is not assignable to '${typeThis}'`);
          return false;
        }
      }
    }
    if (!CallSignature.isAssignable(this.getCallSignatures(), other.getCallSignatures(), reasons)) {
      reasons.push(`Cannot call '${other}' with signatures of '${this}'`);
      return false;
    }
    if (!CallSignature.isAssignable(this.getNewSignatures(), other.getNewSignatures(), reasons)) {
      reasons.push(`Cannot call '${other}' as constructor with signatures of '${this}'`);
      return false;
    }
    return true;
  }
}
