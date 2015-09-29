import Type from "../Type";
import IntersectionType from "./IntersectionType";
import Operator, {NativeOperator, MethodOperator} from "../Operator";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";
import Member, {Constness} from "../Member";
import TypeThunk from "../thunk/TypeThunk";

export default
class UnionType extends Type {
  types: Type[];

  // TODO: memoize
  constructor(types: Type[], loc: SourceLocation) {
    super("", [], loc);

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

    this.selfMembers = buildMembers(this.location, this.types);
    this.selfCallSignatures = buildCallSignatures(this.location, this.types);
  }

  isAssignableUncached(other: Type, reasons: string[]): boolean {
    for (const type of this.types) {
      if (type.isAssignable(other, reasons)) {
        return true;
      }
    }
    reasons.push(`Type '${other}' is not one of '${this}'`);
    return false;
  }
}

function intersection<T>(xs: Set<T>, ys: Set<T>) {
  const ret = new Set<T>();
  for (const y of ys) {
    if (xs.has(y)) {
      ret.add(y);
    }
  }
  return ret;
}

function buildMembers(location: SourceLocation, types: Type[]) {
  const resultMembers = new Map<string, Member>();
  const names = types
    .map(t => new Set(t.getMembers().keys()))
    .reduce(intersection);
  for (const name of names) {
    const members = types.map(t => t.getMember(name));
    const memberTypes = members.map(m => m.type.get());
    const type = new UnionType(memberTypes, location);
    if (members.some(m => m.constness === Constness.Variable)) {
      const settingType = new IntersectionType(memberTypes, location);
      resultMembers.set(name, new Member(Constness.Variable, type, settingType));
    } else {
      resultMembers.set(name, new Member(Constness.Constant, type));
    }
  }
  return resultMembers;
}

function buildCallSignatures(location: SourceLocation, types: Type[]) {
  return types
    .map(t => t.getCallSignatures())
    .reduce((a, b) => unionCallSignatures(location, a, b));
}

function unionCallSignatures(location: SourceLocation, signatures1: CallSignature[], signatures2: CallSignature[]) {
  // ((Foo, Bar), (Bar, Foo)) & ((Hoge, Piyo), (Piyo, Hoge))
  // ->
  // (Foo, Bar) & (Hoge, Piyo), (Foo, Bar) & (Piyo, Hoge), ...

  const signatures: CallSignature[] = [];

  for (const sig1 of signatures1) {
    const sigs2 = signatures2.filter(s => s.params.length == sig1.params.length);
    for (const sig2 of sigs2) {
      signatures.push(new CallSignature(
        new IntersectionType([sig1.selfType, sig2.selfType], location),
        sig1.params.map((p, i) => new IntersectionType([p, sig2.params[i]], location)),
        new UnionType([sig1.returnType, sig2.returnType], location)
      ));
    }
  }
  return signatures;
}
