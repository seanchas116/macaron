import Type from "./Type";
import {voidType} from "./nativeTypes";

export default
class NativeOperatorType extends Type {
  constructor(public operatorName: string, public nativeOperator: string) {
    super(`<operator ${nativeOperator}>`, voidType);
  }
}
