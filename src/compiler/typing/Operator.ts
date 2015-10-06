import CallSignature from "./CallSignature";
import Type from "./Type";
import {voidType} from "./nativeTypes";

export default
class Operator {
  type = voidType;
}

export
class NativeOperator extends Operator {
  constructor(public nativeOperatorName: string, public type: Type) {
    super();
  }
}

export
class MethodOperator extends Operator {

  constructor(objType: Type, public methodName: string) {
    super();
    this.type = objType.members.get(methodName).type.get();
    if (!this.type) {
      throw new Error("no method found");
    }
  }
}
