import Type, {Assignability} from "../Type";

export default
class ConstValueType extends Type {
  constructor(public type: Type, public constValue: any) {
    super(`[${constValue}]`, [type]);
  }

  isAssignableUncached(other: Type, reasons: string[]): boolean {
    if (other instanceof ConstValueType) {
      if(!this.type.isAssignable(other.type, reasons)) {
        return false;
      }
      if (this.constValue !== other.constValue) {
        reasons.push(`Constant value '${other.constValue}' is not equal to '${this.constValue}'`);
        return false;
      }
      return true;
    }
    reasons.push(`Type '${other}' does not represent a constant value`);
    return false;
  }
}
