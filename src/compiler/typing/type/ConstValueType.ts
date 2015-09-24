import Type, {Assignability} from "../Type";

export default
class ConstValueType extends Type {
  constructor(public type: Type, public constValue: any) {
    super(`[${constValue}]`, [type]);
  }

  checkAssignableUncached(other: Type): Assignability {
    if (other instanceof ConstValueType) {
      const result = this.type.checkAssignable(other.type);
      if (!result.result) {
        return result;
      }
      if (this.constValue !== other.constValue) {
        return {
          result: false,
          reason: `Constant value '${other.constValue}' is not equal to '${this.constValue}'`
        };
      }
      return {result: true};
    }
    return {
      result: false,
      reason: `Type '${other}' does not represent a constant value`
    };
  }
}
