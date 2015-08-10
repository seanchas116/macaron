import CallSignature from "./CallSignature";
import Type from "./Type";

export default
class Operator {
  constructor() {
  }
  get type(): Type {
    throw new Error("not implemented");
  }
}

export
class NativeOperator extends Operator {
  constructor(public nativeOperatorName: string, public type: Type) {
    super();
  }
}

export
class MethodOperator extends Operator {
  constructor(public type: Type, public methodName: string) {
    super();
    this.type = type.members.get(methodName);
    if (!this.type) {
      throw new Error("no method found");
    }
  }
}
