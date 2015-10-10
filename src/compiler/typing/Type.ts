import CallSignature from "./CallSignature";
import Expression from "./Expression";
import Operator from "./Operator";
import Member, {Constness} from "./Member";
import Environment from "./Environment";
import SourceLocation from "../common/SourceLocation";
import GenericsParameterType from "./type/GenericsParameterType";
import {intersection} from "../util/set";
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

function mergeMaps<TKey, TValue>(maps: Map<TKey, TValue>[]) {
  return maps.reduce(mergeMap);
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
  callSignatures: CallSignature[] = [];
  newSignatures: CallSignature[] = [];
  genericsPlaceholders = new Set<GenericsParameterType>();

  constructor(public name: string, public superTypes: Type[], public environment: Environment, public location: SourceLocation = null, public expression: Expression = null) {
    this.location = location || SourceLocation.empty();
  }

  toString() {
    return this.name;
  }

  getMembers(): Map<string, Member> {
    return mergeMaps([...this.superTypes.map(t => t.getMembers()), this.selfMembers]);
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

  getBinaryOperators(): Map<string, Operator> {
    return mergeMaps([...this.superTypes.map(t => t.getBinaryOperators()), this.selfBinaryOperators]);
  }

  getUnaryOperators(): Map<string, Operator> {
    return mergeMaps([...this.superTypes.map(t => t.getUnaryOperators()), this.selfUnaryOperators]);
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
    for (const [name, memberThis] of this.selfMembers) {
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
    if (!CallSignature.isAssignable(this.callSignatures, other.callSignatures, reasons, ignoreThis)) {
      reasons.unshift(`Cannot call '${other}' with signatures of '${this}'`);
      return false;
    }
    if (!CallSignature.isAssignable(this.newSignatures, other.newSignatures, reasons, ignoreThis)) {
      reasons.unshift(`Cannot call '${other}' as constructor with signatures of '${this}'`);
      return false;
    }
    return true;
  }

  resolveGenerics(types: Map<GenericsParameterType, Type>): Type {
    if (intersection(new Set(types.keys()), this.genericsPlaceholders).size == 0) {
      return this;
    }
    return this.mapTypes(t => t.resolveGenerics(types));
  }

  mapTypes(mapper: (type: Type) => Type) {
    const newType = new Type(this.name, this.superTypes, this.environment, this.location, this.expression);

    for (const [name, member] of this.selfMembers) {
      newType.selfMembers.set(name, member.mapType(mapper));
    }
    // TODO: operators

    newType.callSignatures = this.callSignatures.map(sig => sig.mapTypes(mapper));
    newType.newSignatures = this.newSignatures.map(sig => sig.mapTypes(mapper));

    return newType;
  }
}
