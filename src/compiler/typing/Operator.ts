import CallSignature from "./CallSignature";
import Type from "./Type";
import {TypeThunk} from "./Thunk";
import {voidType} from "./nativeTypes";

export default
class Operator {
  type = TypeThunk.resolve(voidType);
}

export
class NativeOperator extends Operator {
  constructor(public nativeOperatorName: string, type: Type|TypeThunk) {
    super();
    this.type = TypeThunk.resolve(type);
  }
}

export
class MethodOperator extends Operator {

  constructor(objType: Type|TypeThunk, public methodName: string) {
    super();
    const objTypeThunk = TypeThunk.resolve(objType);
    this.type = new TypeThunk(objTypeThunk.location, () => objTypeThunk.get().getMember(methodName).getType());
    if (!this.type) {
      throw new Error("no method found");
    }
  }
}
