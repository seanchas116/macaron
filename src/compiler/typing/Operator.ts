import CallSignature from "./CallSignature";
import Type from "./Type";

export default
class Operator {
  constructor() {
  }
  get callSignatures(): CallSignature[] {
    throw new Error("not implemented");
  }
}

export
class NativeOperator extends Operator {
  constructor(public nativeOperatorName: string, public callSignatures: CallSignature[]) {
    super();
  }
}

export
class MethodOperator extends Operator {
  constructor(public type: Type, public methodName: string) {
    super();
    this.callSignatures = type.members.get(methodName).callSignatures;
  }
}
