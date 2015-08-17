import Type from "./Type";
import {TypeThunk} from "./Thunk";

export default
class CallSignature {
  returnType: TypeThunk;

  constructor(public selfType: Type, public params: Type[], returnType: Type|TypeThunk) {
    this.returnType = TypeThunk.resolve(returnType);
  }

  isCallable(selfType: Type, args: Type[]) {
    if (this.params.length !== args.length) {
      return false;
    }
    if (!selfType.isCastableTo(this.selfType)) {
      return false;
    }
    for (let i = 0; i < args.length; ++i) {
      if (!args[i].isCastableTo(this.params[i])) {
        return false;
      }
    }
    return true;
  }

  isCastableTo(other: CallSignature) {
    // OK: (Object)=>Array to (Array)=>Object
    // NG: (Array)=>Object to (Object)=>Array
    if (!this.isCallable(other.selfType, other.params)) {
      return false;
    }
    if (!this.returnType.get().isCastableTo(other.returnType.get())) {
      return false;
    }
    return true;
  }

  static isCastableTo(fromSigs: CallSignature[], toSigs: CallSignature[]) {
    return toSigs.every(toSig => {
      return fromSigs.some(fromSig => fromSig.isCastableTo(toSig));
    });
  }
}
