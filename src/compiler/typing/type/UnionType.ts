import Type from "../Type";
import Environment from "../Environment";
import IntersectionType from "./IntersectionType";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import SourceRange from "../../common/SourceRange";
import Member, {Constness} from "../Member";
import TypeThunk from "../thunk/TypeThunk";
import {intersection} from "../../util/set";

export default
class UnionType extends Type {
  types: Type[];

  // TODO: memoize
  constructor(types: Type[], env: Environment, range: SourceRange) {
    super("", [], env, range);

    if (types.length === 0) {
      throw new Error("cannot create union with no type");
    }

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
    this.name = types.join(" | ");

    this.selfMembers = buildMembers(env, this.range, this.types);
    this.callSignatures = buildCallSignatures(env, this.range, this.types);
  }

  isAssignableUncached(other: Type, reasons: string[]): boolean {
    for (const type of this.types) {
      if (type.isAssignable(other, reasons)) {
        return true;
      }
    }
    reasons.unshift(`Type '${other}' is not one of '${this}'`);
    return false;
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new UnionType(this.types.map(mapper), this.environment, this.range);
  }
}

function buildMembers(env: Environment, range: SourceRange, types: Type[]) {
  const resultMembers = new Map<string, Member>();
  const names = types
    .map(t => new Set(t.getMembers().keys()))
    .reduce(intersection);
  for (const name of names) {
    const members = types.map(t => t.getMembers().get(name));
    const memberTypes = members.map(m => m.type.get());
    const type = new UnionType(memberTypes, env, range);
    if (members.some(m => m.constness === Constness.Variable)) {
      const settingType = new IntersectionType(memberTypes, env, range);
      resultMembers.set(name, new Member(Constness.Variable, type, settingType));
    } else {
      resultMembers.set(name, new Member(Constness.Constant, type));
    }
  }
  return resultMembers;
}

function buildCallSignatures(env: Environment, range: SourceRange, types: Type[]) {
  return types
    .map(t => t.callSignatures)
    .reduce((a, b) => unionCallSignatures(env, range, a, b));
}

function unionCallSignatures(env: Environment, range: SourceRange, signatures1: CallSignature[], signatures2: CallSignature[]) {
  // ((Foo, Bar), (Bar, Foo)) & ((Hoge, Piyo), (Piyo, Hoge))
  // ->
  // (Foo, Bar) & (Hoge, Piyo), (Foo, Bar) & (Piyo, Hoge), ...

  const signatures: CallSignature[] = [];

  for (const sig1 of signatures1) {
    const sigs2 = signatures2.filter(s => s.params.length == sig1.params.length);
    for (const sig2 of sigs2) {
      signatures.push(new CallSignature(
        new IntersectionType([sig1.selfType, sig2.selfType], env, range),
        sig1.params.map((p, i) => new IntersectionType([p, sig2.params[i]], env, range)),
        new UnionType([sig1.returnType, sig2.returnType], env, range)
      ));
    }
  }
  return signatures;
}
