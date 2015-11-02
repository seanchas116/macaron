import Type, {Assignability} from "../Type";
import InterfaceType from "./InterfaceType";
import Environment from "../Environment";
import SourceRange from "../../common/SourceRange";

export default
class ConstValueType extends InterfaceType {
  constructor(
    public type: Type,
    public constValue: any,
    env: Environment, range: SourceRange
  ) {
    super(`[${constValue}]`, [type], env, range);
  }

  isAssignableUncached(other: Type, reasons: string[]): boolean {
    if (other instanceof ConstValueType) {
      if(!this.type.isAssignable(other.type, reasons)) {
        return false;
      }
      if (this.constValue !== other.constValue) {
        reasons.unshift(`Constant value '${other.constValue}' is not equal to '${this.constValue}'`);
        return false;
      }
      return true;
    }
    reasons.unshift(`Type '${other}' does not represent a constant value`);
    return false;
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new ConstValueType(
      mapper(this.type),
      this.constValue,
      this.environment,
      this.range
    );
  }
}
