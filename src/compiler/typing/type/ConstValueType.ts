import Type from "../Type";

export default
class ConstValueType extends Type {
  constructor(public type: Type, public constValue: any) {
    super(`[${constValue}]`, [type]);
  }

  isAssignable(other: Type): boolean {
    if (other instanceof ConstValueType) {
      return this.constValue === other.constValue && this.type.isAssignable(other.type);
    }
    return false;
  }
}
