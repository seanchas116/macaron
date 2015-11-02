import CallSignature from "../CallSignature";
import Operator from "../Operator";
import Member, {Constness} from "../Member";
import Environment from "../Environment";
import Type from "../Type";
import SourceRange from "../../common/SourceRange";

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

export default
class InterfaceType extends Type {
  selfMembers = new Map<string, Member>();
  selfBinaryOperators = new Map<string, Operator>();
  selfUnaryOperators = new Map<string, Operator>();
  callSignatures: CallSignature[] = [];
  newSignatures: CallSignature[] = [];

  constructor(
    name: string,
    public superTypes: Type[],
    environment: Environment,
    range: SourceRange
  ) {
    super(name, environment, range);
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

  getCallSignatures() {
    return this.callSignatures;
  }
  getNewSignatures() {
    return this.newSignatures;
  }

  mapTypes(mapper: (type: Type) => Type) {
    const newType = new InterfaceType(this.name, this.superTypes, this.environment, this.range);

    for (const [name, member] of this.selfMembers) {
      newType.selfMembers.set(name, member.mapType(mapper));
    }
    // TODO: operators

    newType.callSignatures = this.callSignatures.map(sig => sig.mapTypes(mapper));
    newType.newSignatures = this.newSignatures.map(sig => sig.mapTypes(mapper));

    return newType;
  }
}
