import Type from "../Type";

export default
class ConstValueType extends Type {
  constructor(type: Type, public constValue: any) {
    super(`[${constValue}]`, [type]);
  }

  isAssignable(other: Type): boolean {
    if (other instanceof ConstValueType) {
      return this.constValue === other.constValue;
    }
    return super.isAssignable(other);
  }
}
