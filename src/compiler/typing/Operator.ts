import Type from "./Type";
import {voidType} from "./defaultEnvironment";

export default
class Operator {
  type: Type = voidType;
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
    this.type = objType.getMember(methodName).type.get();
    if (!this.type) {
      throw new Error("no method found");
    }
  }
}
