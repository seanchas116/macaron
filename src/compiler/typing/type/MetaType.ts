import Type from "../Type";
import Environment from "../Environment";
import Expression from "../Expression";
import SourceRange from "../../common/SourceRange";

export default
class MetaType extends Type {
  constructor(public type: Type, public metaType: Type, env: Environment, range: SourceRange, public typeOnly = false) {
    super(type.name, env, range);
  }

  getMembers() {
    return this.type.getMembers();
  }
  getMember(name: string) {
    return this.type.getMember(name);
  }
  getBinaryOperators() {
    return this.type.getBinaryOperators();
  }
  getUnaryOperators() {
    return this.type.getUnaryOperators();
  }
  getCallSignatures() {
    return this.type.getCallSignatures();
  }
  getNewSignatures() {
    return this.type.getNewSignatures();
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new MetaType(mapper(this.type), mapper(this.metaType), this.environment, this.range, this.typeOnly);
  }

  static typeOnly(type: Type) {
    return new MetaType(
      new Type(`[type ${type.name}]`, type.environment, type.range),
      type, type.environment, type.range, true
    );
  }
}
