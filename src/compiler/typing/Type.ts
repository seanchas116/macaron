import CallSignature from "./CallSignature";
import SourceRange from "../common/SourceRange";
import Operator from "./Operator";
import Member, {Constness} from "./Member";
import Environment from "./Environment";
import GenericsParameterType from "./type/GenericsParameterType";
import {intersection} from "../util/set";
const HashMap = require("hashmap");

export
interface Assignability {
  assignable: boolean;
  reasons: string[];
}

const assignabilityResults: Map<[Type, Type], Assignability> = new HashMap();

export default
class Type {
  constructor(public name: string, public environment: Environment, public range: SourceRange) {
  }

  toString() {
    return this.name;
  }

  getMembers() {
    return new Map<string, Member>();
  }
  getMember(name: string): Member {
    return undefined;
  }
  getBinaryOperators() {
    return new Map<string, Operator>();
  }
  getUnaryOperators() {
    return new Map<string, Operator>();
  }
  getCallSignatures(): CallSignature[] {
    return [];
  }
  getNewSignatures(): CallSignature[] {
    return [];
  }

  mapTypes(mapper: (type: Type) => Type): Type {
    return this;
  }

  isAssignable(other: Type, reasons: string[], ignoreThis = false) {
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

    const assignable = this.isAssignableUncached(other, reasons, ignoreThis);

    assignabilityResults.set([this, other], {
      assignable: assignable,
      reasons: Array.from(reasons)
    });
    return assignable;
  }

  equals(other: Type, reasons: string[], ignoreThis = false) {
    return this.isAssignable(other, reasons, ignoreThis) && other.isAssignable(this, reasons, ignoreThis);
  }

  isAssignableUncached(other: Type, reasons: string[], ignoreThis: boolean): boolean {
    for (const [name, memberThis] of this.getMembers()) {
      const memberOther = other.getMember(name);
      if (!memberOther) {
        reasons.unshift(`Type '${other}' do not have member '${name}'`);
        return false;
      }
      const typeThis = memberThis.type.get();
      const typeOther = memberOther.type.get();
      if (memberThis.constness == Constness.Variable) {
        // nonvariant
        if (!typeOther.equals(typeThis, reasons, true)) {
          reasons.unshift(`Member '${name}': '${typeOther}' is not equal to '${typeThis}'`);
          return false;
        }
      }
      else {
        // covariant
        if (!memberThis.type.get().isAssignable(memberOther.type.get(), reasons, true)) {
          reasons.unshift(`Member '${name}': '${typeOther}' is not assignable to '${typeThis}'`);
          return false;
        }
      }
    }
    if (!CallSignature.isAssignable(this.getCallSignatures(), other.getCallSignatures(), reasons, ignoreThis)) {
      reasons.unshift(`Cannot call '${other}' with signatures of '${this}'`);
      return false;
    }
    if (!CallSignature.isAssignable(this.getNewSignatures(), other.getNewSignatures(), reasons, ignoreThis)) {
      reasons.unshift(`Cannot call '${other}' as constructor with signatures of '${this}'`);
      return false;
    }
    return true;
  }

  resolveGenerics(types: Map<GenericsParameterType, Type>): Type {
    if (intersection(new Set(types.keys()), this.environment.getGenericsPlaceholders()).size == 0) {
      return this;
    }
    return this.mapTypes(t => t.resolveGenerics(types));
  }

}
